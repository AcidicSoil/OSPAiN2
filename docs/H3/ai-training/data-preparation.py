#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Data preparation utilities for AI model training.
Part of Horizon 3 (Future) implementation for Ollama Ecosystem.

@context: Connected to knowledge-graph-search-cache.mdc for data caching
@context: Supports training-workflow.md pipeline
"""

import os
import json
import random
import argparse
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path

import numpy as np
import pandas as pd
from datasets import load_dataset, Dataset, DatasetDict
from huggingface_hub import HfApi, create_repo, upload_file
from sklearn.model_selection import train_test_split
from tqdm import tqdm

# Constants
DEFAULT_SEED = 42
DEFAULT_SPLIT_RATIO = 0.1  # 10% for validation
SUPPORTED_FORMATS = ["jsonl", "csv", "json", "txt", "parquet"]

def set_seed(seed: int = DEFAULT_SEED) -> None:
    """Set random seed for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)

def format_instruction_data(
    row: Dict[str, Any], 
    instruction_key: str = "instruction", 
    input_key: str = "input", 
    output_key: str = "output",
    template: Optional[str] = None
) -> Dict[str, str]:
    """Format data into instruction-following format."""
    
    if template:
        # Use custom template if provided
        text = template.format(**row)
    else:
        # Default Alpaca-style formatting
        text = f"### Instruction: {row.get(instruction_key, '')}\n\n"
        
        if input_key in row and row[input_key]:
            text += f"### Input: {row.get(input_key, '')}\n\n"
        
        text += f"### Response: {row.get(output_key, '')}"
    
    return {"text": text}

def load_and_process_data(
    data_path: str,
    format_type: str = "jsonl",
    instruction_key: str = "instruction",
    input_key: str = "input",
    output_key: str = "output",
    limit: Optional[int] = None,
    template: Optional[str] = None,
    seed: int = DEFAULT_SEED
) -> Dataset:
    """Load data from path and format for instruction tuning."""
    set_seed(seed)
    
    # Load dataset based on format
    if data_path.startswith("hf://"):
        # Load from Hugging Face
        hf_path = data_path.replace("hf://", "")
        dataset = load_dataset(hf_path)
        if isinstance(dataset, DatasetDict):
            dataset = dataset["train"]
    else:
        # Load from local file
        if format_type == "jsonl":
            df = pd.read_json(data_path, lines=True)
        elif format_type == "csv":
            df = pd.read_csv(data_path)
        elif format_type == "json":
            df = pd.read_json(data_path)
        elif format_type == "parquet":
            df = pd.read_parquet(data_path)
        elif format_type == "txt":
            with open(data_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            df = pd.DataFrame({"text": lines})
        else:
            raise ValueError(f"Unsupported format: {format_type}")
        
        # Convert to Dataset
        dataset = Dataset.from_pandas(df)
    
    # Limit dataset size if specified
    if limit and limit < len(dataset):
        dataset = dataset.select(range(limit))
    
    # Format data
    formatted_dataset = dataset.map(
        lambda x: format_instruction_data(
            x, 
            instruction_key=instruction_key,
            input_key=input_key,
            output_key=output_key,
            template=template
        )
    )
    
    return formatted_dataset

def create_train_validation_split(
    dataset: Dataset,
    val_ratio: float = DEFAULT_SPLIT_RATIO,
    seed: int = DEFAULT_SEED
) -> Tuple[Dataset, Dataset]:
    """Split dataset into training and validation sets."""
    set_seed(seed)
    
    train_idx, val_idx = train_test_split(
        range(len(dataset)),
        test_size=val_ratio,
        random_state=seed
    )
    
    train_dataset = dataset.select(train_idx)
    val_dataset = dataset.select(val_idx)
    
    return train_dataset, val_dataset

def export_dataset(
    dataset: Dataset,
    output_path: str,
    format_type: str = "jsonl"
) -> None:
    """Export dataset to file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    if format_type == "jsonl":
        dataset.to_json(output_path, orient="records", lines=True)
    elif format_type == "csv":
        dataset.to_csv(output_path, index=False)
    elif format_type == "json":
        dataset.to_json(output_path, orient="records")
    elif format_type == "parquet":
        dataset.to_parquet(output_path)
    else:
        raise ValueError(f"Unsupported export format: {format_type}")

def upload_to_hub(
    dataset: Dataset,
    repo_name: str,
    token: str,
    dataset_name: str = "custom_dataset"
) -> str:
    """Upload dataset to Hugging Face Hub."""
    api = HfApi()
    api.set_token(token)
    
    # Create repo if not exists
    try:
        create_repo(repo_name, token=token, repo_type="dataset")
    except Exception as e:
        print(f"Repo already exists or error: {e}")
    
    # Save to temp file
    tmp_file = f"{dataset_name}.jsonl"
    dataset.to_json(tmp_file, orient="records", lines=True)
    
    # Upload
    url = upload_file(
        path_or_fileobj=tmp_file,
        path_in_repo=tmp_file,
        repo_id=repo_name,
        token=token,
        repo_type="dataset"
    )
    
    # Clean up
    os.remove(tmp_file)
    
    return url

def filter_by_length(
    dataset: Dataset,
    text_key: str = "text",
    min_length: Optional[int] = None,
    max_length: Optional[int] = None
) -> Dataset:
    """Filter dataset by text length."""
    if min_length is None and max_length is None:
        return dataset
    
    def check_length(example):
        text_len = len(example[text_key])
        
        if min_length and text_len < min_length:
            return False
        
        if max_length and text_len > max_length:
            return False
        
        return True
    
    filtered = dataset.filter(check_length)
    print(f"Filtered dataset from {len(dataset)} to {len(filtered)} examples")
    return filtered

def main():
    """Main function to prepare data for training."""
    parser = argparse.ArgumentParser(description="Data preparation for AI model training")
    parser.add_argument("--data-path", type=str, required=True, help="Path to input data")
    parser.add_argument("--output-path", type=str, required=True, help="Path to save processed data")
    parser.add_argument("--format", type=str, choices=SUPPORTED_FORMATS, default="jsonl", help="Input data format")
    parser.add_argument("--instruction-key", type=str, default="instruction", help="Key for instruction field")
    parser.add_argument("--input-key", type=str, default="input", help="Key for input field")
    parser.add_argument("--output-key", type=str, default="output", help="Key for output field")
    parser.add_argument("--template", type=str, help="Custom template for formatting")
    parser.add_argument("--limit", type=int, help="Limit number of examples")
    parser.add_argument("--val-ratio", type=float, default=DEFAULT_SPLIT_RATIO, help="Validation split ratio")
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED, help="Random seed")
    parser.add_argument("--min-length", type=int, help="Minimum text length")
    parser.add_argument("--max-length", type=int, help="Maximum text length")
    parser.add_argument("--upload-hub", action="store_true", help="Upload to Hugging Face Hub")
    parser.add_argument("--hub-repo", type=str, help="Hugging Face Hub repository name")
    parser.add_argument("--hub-token", type=str, help="Hugging Face Hub token")
    
    args = parser.parse_args()
    
    # Load and process data
    print(f"Loading data from {args.data_path}")
    dataset = load_and_process_data(
        args.data_path,
        format_type=args.format,
        instruction_key=args.instruction_key,
        input_key=args.input_key,
        output_key=args.output_key,
        limit=args.limit,
        template=args.template,
        seed=args.seed
    )
    
    # Filter by length if specified
    if args.min_length or args.max_length:
        dataset = filter_by_length(
            dataset,
            min_length=args.min_length,
            max_length=args.max_length
        )
    
    # Split data
    train_dataset, val_dataset = create_train_validation_split(
        dataset,
        val_ratio=args.val_ratio,
        seed=args.seed
    )
    
    # Save to disk
    print(f"Saving processed data to {args.output_path}")
    os.makedirs(args.output_path, exist_ok=True)
    
    train_path = os.path.join(args.output_path, "train.jsonl")
    val_path = os.path.join(args.output_path, "val.jsonl")
    
    export_dataset(train_dataset, train_path, format_type="jsonl")
    export_dataset(val_dataset, val_path, format_type="jsonl")
    
    # Upload to Hub if requested
    if args.upload_hub:
        if not args.hub_repo or not args.hub_token:
            print("Missing hub-repo or hub-token for upload")
        else:
            print(f"Uploading dataset to Hugging Face Hub: {args.hub_repo}")
            train_url = upload_to_hub(
                train_dataset,
                args.hub_repo,
                args.hub_token,
                dataset_name="train"
            )
            val_url = upload_to_hub(
                val_dataset,
                args.hub_repo,
                args.hub_token,
                dataset_name="val"
            )
            print(f"Uploaded train dataset: {train_url}")
            print(f"Uploaded val dataset: {val_url}")
    
    print("Data preparation complete!")
    print(f"Train dataset: {len(train_dataset)} examples")
    print(f"Validation dataset: {len(val_dataset)} examples")

if __name__ == "__main__":
    main() 