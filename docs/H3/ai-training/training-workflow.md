# End-to-End AI Model Training Workflow
<!-- @context: Connected to sovereign_ai_implementation.mdc for infrastructure integration -->
<!-- @context: Utilizes knowledge-graph-search-cache.mdc for training data -->
<!-- @context: Integrates with context-distributor.js for knowledge preservation -->
<!-- @context: Follows development modes from master-prd.mdc -->

## Phase 1: Setup and Initial Training (1-2 Days)

### Day 1: Environment Setup

```bash
# Create a virtual environment
python -m venv llm-env
source llm-env/bin/activate  # On Windows: llm-env\Scripts\activate

# Install required packages
pip install torch==2.0.1 transformers==4.30.2 datasets peft trl
pip install bitsandbytes accelerate 
pip install -U optimum

# Verify GPU access
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}, Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else None}')"
```

### Day 1: Prepare a Simple Dataset

```python
from datasets import load_dataset

# Start with a small, focused dataset (code instruction example)
dataset = load_dataset("sahil2801/code-alpaca-instruct")

# Split and prepare
train_dataset = dataset["train"].select(range(min(len(dataset["train"]), 1000)))  # Start with 1000 examples

# Format into instruction format
def format_instruction(example):
    return {
        "text": f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
    }

formatted_dataset = train_dataset.map(format_instruction)
formatted_dataset.save_to_disk("code_instruction_dataset")
```

### Day 1: First Training Run with TinyLlama

```python
import os
from transformers import (
    AutoModelForCausalLM, AutoTokenizer, 
    TrainingArguments, Trainer, 
    BitsAndBytesConfig, DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# Load model and tokenizer
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Configure model with 8-bit quantization to fit in smaller VRAM
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,
    device_map="auto"
)

# Prepare for training
model = prepare_model_for_kbit_training(model)

# Setup LoRA configuration - very conservative to start
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

# Tokenize dataset
def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, max_length=512)

tokenized_dataset = formatted_dataset.map(
    tokenize_function, 
    batched=True,
    remove_columns=["text"]
)

# Setup training arguments - short run for testing
training_args = TrainingArguments(
    output_dir="./results/tinyllama-code",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,  # Effective batch size = 4*8 = 32
    warmup_steps=10,
    max_steps=100,  # Short run to test
    learning_rate=3e-4,
    fp16=True,
    logging_steps=10,
    save_steps=50
)

# Create trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

# Train
trainer.train()

# Save adapter
model.save_pretrained("./results/tinyllama-code/checkpoint-final")
```

## Phase 2: Evaluation and Iteration (Day 2-3)

### Day 2: Test your model

```python
from peft import PeftModel

# Load base model and adapter
base_model = AutoModelForCausalLM.from_pretrained(
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    load_in_8bit=True,
    device_map="auto"
)
model = PeftModel.from_pretrained(base_model, "./results/tinyllama-code/checkpoint-final")

# Test on some examples
prompt = "### Instruction: Write a Python function to check if a string is a palindrome\n\n### Input: \n\n### Response:"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(inputs=inputs.input_ids, max_new_tokens=200)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### Day 2-3: Improve your training

```python
# Refine your dataset based on results
# Example: Add more specific examples where the model performed poorly

# Adjust LoRA parameters and train again
lora_config = LoraConfig(
    r=16,  # Increased rank
    lora_alpha=32,  # Increased alpha
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # More layers
    lora_dropout=0.1,
    bias="none",
    task_type="CAUSAL_LM"
)

# Train for longer
training_args = TrainingArguments(
    output_dir="./results/tinyllama-code-improved",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,
    warmup_steps=50,
    max_steps=500,  # Longer training
    learning_rate=2e-4,  # Slightly lower learning rate
    fp16=True,
    logging_steps=10,
    save_steps=100
)

# Run training again
# ...
```

## Phase 3: Scale Up (Day 4-7)

### Day 4: Move to Phi-2 (2.7B)

```python
# Apply the same workflow to a larger model (Phi-2)
model_name = "microsoft/phi-2"
# Use 4-bit quantization for the larger model
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)

# Apply same training process with adjusted parameters...
```

### Day 5-6: Add evaluation metrics

```python
from evaluate import load

# Add formal evaluation
rouge = load("rouge")
bleu = load("bleu")

def compute_metrics(pred):
    labels_ids = pred.label_ids
    pred_ids = pred.predictions
    
    # Decode
    pred_str = tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
    labels_ids[labels_ids == -100] = tokenizer.pad_token_id
    label_str = tokenizer.batch_decode(labels_ids, skip_special_tokens=True)
    
    # Compute metrics
    rouge_output = rouge.compute(predictions=pred_str, references=label_str)
    bleu_output = bleu.compute(predictions=pred_str, references=label_str)
    
    return {
        "rouge1": rouge_output["rouge1"],
        "bleu": bleu_output["bleu"],
    }

# Update trainer with metrics
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    eval_dataset=eval_dataset,  # Add validation set
    compute_metrics=compute_metrics,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)
```

### Day 7: Prepare to scale to 7B model on cloud GPU

```bash
# Export your adapter and dataset to prepare for cloud training
# Create a simple inference script for your final model

# Example cloud setup script for Vast.ai or similar
cat > setup.sh << 'EOL'
#!/bin/bash
apt update && apt install -y git python3-pip
pip install torch==2.0.1 transformers datasets peft trl
pip install bitsandbytes accelerate optimum
git clone https://github.com/yourusername/your-training-repo.git
cd your-training-repo
python train.py --model mistralai/Mistral-7B-v0.1 \
    --lora_r 16 --lora_alpha 32 \
    --dataset your_dataset.jsonl
EOL

# Push your code to GitHub
git add .
git commit -m "Ready for cloud training"
git push
```

## Integration with Sovereign AI Infrastructure

This workflow will integrate with the following Ollama ecosystem components:

1. **Knowledge Graph Integration**:
   - Cache embeddings of training examples
   - Store relationships between concepts
   - Track model performance on different tasks
   - Save and retrieve fine-tuning datasets

2. **Local-First Model Serving**:
   - Deploy fine-tuned models to local model server
   - Optimize inference performance
   - Handle model versioning and rollback
   - Implement graceful fallback to base models

3. **Development Mode Support**:
   - 🎨 Design Mode: Rapid prototyping of model capabilities
   - 🔧 Engineering Mode: Core training implementation
   - 🧪 Testing Mode: Comprehensive evaluation and benchmarking
   - 📦 Deployment Mode: Packaging models for distribution
   - 🔍 Maintenance Mode: Monitoring model performance

4. **Multi-level Caching**:
   - L1: In-memory cache for frequent requests
   - L2: Disk-based cache for persistence
   - L3: Semantic cache for similar requests
   
5. **Future Expansion**:
   - Distributed training across multiple devices
   - Automated hyperparameter optimization
   - Continuous model improvement based on usage
   - Model merging and ensemble techniques 