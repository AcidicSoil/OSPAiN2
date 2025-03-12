# Ollama Ecosystem Design Schematics

This document provides architectural diagrams and design schematics for the Ollama ecosystem components.

## System Architecture Overview

```mermaid
graph TD
    User((User)) --> |Voice/Text| Interface[User Interfaces]
    Interface --> OV[OllamaVoice]
    Interface --> OHC[OllamaHomeControl]
    Interface --> OH[OllamaHub]
    Interface --> Mobile[Mobile Clients]
    
    subgraph "Core Intelligence Layer"
        OV --> |Processes Voice| OllamaAPI[Ollama API]
        OHC --> |Processes Commands| OllamaAPI
        OH --> |Knowledge Queries| OllamaAPI
        OllamaAPI --> |Model Inference| Models[(LLM Models)]
        ResourceMgr[Resource Manager] --> OllamaAPI
    end
    
    subgraph "Shared Components"
        OV --> SharedUtils[Shared Utilities]
        OHC --> SharedUtils
        OH --> SharedUtils
        SharedUtils --> IntegrationAPIs[Integration APIs]
        SharedUtils --> DataModels[Data Models]
        SharedUtils --> PromptTemplates[Prompt Templates]
    end
    
    subgraph "External Integrations"
        OHC --> HomeAssistant[Home Assistant]
        HomeAssistant --> SmartDevices[(Smart Devices)]
        OH --> VectorDB[(Vector Database)]
        OV --> AudioProcessing[Audio Processing]
    end
    
    subgraph "Expansion Components"
        OllamaInsights[OllamaInsights] --> OllamaAPI
        OllamaFlow[OllamaFlow] --> OllamaAPI
        OllamaCLI[OllamaCLI] --> OllamaAPI
        OllamaInsights --> SharedUtils
        OllamaFlow --> SharedUtils
        OllamaCLI --> SharedUtils
    end
    
    classDef core fill:#f9f,stroke:#333,stroke-width:2px;
    classDef shared fill:#bbf,stroke:#333,stroke-width:1px;
    classDef external fill:#bfb,stroke:#333,stroke-width:1px;
    classDef expansion fill:#fbb,stroke:#333,stroke-width:1px;
    
    class OV,OHC,OH core;
    class SharedUtils,IntegrationAPIs,DataModels,PromptTemplates shared;
    class HomeAssistant,VectorDB,AudioProcessing external;
    class OllamaInsights,OllamaFlow,OllamaCLI expansion;
```

## OllamaVoice Component Architecture

```mermaid
graph TD
    User((User)) --> |Speaks| MicInput[Microphone Input]
    MicInput --> STT[Speech-to-Text]
    STT --> IntentRec[Intent Recognition]
    IntentRec --> |Prompt Construction| OllamaAPI[Ollama API]
    OllamaAPI --> |Processed Response| ResponseGen[Response Generation]
    ResponseGen --> TTS[Text-to-Speech]
    TTS --> Speaker[Speaker Output]
    Speaker --> User
    
    subgraph "Integration Points"
        IntentRec --> |Command Intent| OHCIntegration[OllamaHomeControl Integration]
        IntentRec --> |Query Intent| OHIntegration[OllamaHub Integration]
        ResponseGen <-- |Knowledge Responses| OHIntegration
        ResponseGen <-- |Device Status| OHCIntegration
    end
    
    subgraph "Memory & Context"
        ConvoContext[Conversation Context]
        ConvoContext --> IntentRec
        ConvoContext --> ResponseGen
        IntentRec --> ConvoContext
    end
```

## OllamaHomeControl Component Architecture

```mermaid
graph TD
    Input[Natural Language Input] --> IntentParser[Intent Parser]
    IntentParser --> |Device Control Intent| DeviceController[Device Controller]
    IntentParser --> |Automation Intent| AutomationCreator[Automation Creator]
    IntentParser --> |Scene Intent| SceneManager[Scene Manager]
    IntentParser --> |Query Intent| StateManager[State Manager]
    
    subgraph "Home Assistant Integration"
        DeviceController --> HAPI[Home Assistant API]
        AutomationCreator --> HAPI
        SceneManager --> HAPI
        StateManager <--> HAPI
        HAPI --> Devices[(Smart Devices)]
    end
    
    subgraph "Ollama Integration"
        IntentParser <--> OllamaAPI[Ollama API]
        DeviceController --> |Complex Commands| OllamaAPI
        AutomationCreator --> |Automation Logic| OllamaAPI
    end
    
    subgraph "Integration Points"
        OVIntegration[OllamaVoice Integration] --> IntentParser
        DeviceController --> OVIntegration
        StateManager --> OVIntegration
        OHIntegration[OllamaHub Integration] <--> StateManager
    end
    
    subgraph "Caching & Optimization"
        StateCache[(State Cache)]
        <--> StateManager
        DeviceController --> StateCache
    end
```

## OllamaHub Component Architecture

```mermaid
graph TD
    Input[Query Input] --> QueryProcessor[Query Processor]
    QueryProcessor --> |Vector Search| RAGEngine[RAG Engine]
    RAGEngine --> |Retrieval| VectorStore[(Vector Database)]
    RAGEngine --> |Augmented Prompt| OllamaAPI[Ollama API]
    OllamaAPI --> ResponseGenerator[Response Generator]
    
    subgraph "Document Management"
        DocImport[Document Import] --> DocProcessor[Document Processor]
        DocProcessor --> Embedder[Embedding Generator]
        Embedder --> VectorStore
        DocProcessor --> Indexer[Document Indexer]
        Indexer --> DocIndex[(Document Index)]
    end
    
    subgraph "Context Management"
        ContextManager[Context Manager]
        UserProfile[(User Profiles)]
        SessionContext[(Session Context)]
        ContextManager <--> UserProfile
        ContextManager <--> SessionContext
        QueryProcessor <--> ContextManager
        ResponseGenerator --> ContextManager
    end
    
    subgraph "Integration Points"
        OVIntegration[OllamaVoice Integration] --> QueryProcessor
        ResponseGenerator --> OVIntegration
        OHCIntegration[OllamaHomeControl Integration] <--> ContextManager
    end
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant OV as OllamaVoice
    participant OHC as OllamaHomeControl
    participant OH as OllamaHub
    participant Ollama as Ollama API
    participant HA as Home Assistant
    
    User->>OV: "Turn on living room lights"
    OV->>Ollama: Process speech to text
    Ollama-->>OV: Transcribed command
    OV->>OV: Identify intent as device control
    OV->>OHC: Forward device control request
    OHC->>OH: Query for user preferences
    OH-->>OHC: Return user lighting preferences
    OHC->>HA: Send device command with preferences
    HA-->>OHC: Confirm action completed
    OHC-->>OV: Report action status
    OV-->>User: "Living room lights turned on"
```

## Resource Management Architecture

```mermaid
graph TD
    subgraph "Resource Manager"
        ModelLoader[Model Loader]
        LoadBalancer[Load Balancer]
        QueueManager[Queue Manager]
        ResourceMonitor[Resource Monitor]
        
        ResourceMonitor --> LoadBalancer
        ResourceMonitor --> ModelLoader
        QueueManager --> LoadBalancer
    end
    
    OV[OllamaVoice] --> QueueManager
    OHC[OllamaHomeControl] --> QueueManager
    OH[OllamaHub] --> QueueManager
    
    LoadBalancer --> OllamaAPI[Ollama API]
    ModelLoader --> Models[(LLM Models)]
    OllamaAPI --> Models
    
    subgraph "Resource Policies"
        PriorityRules[Priority Rules]
        CachingPolicy[Caching Policy]
        ModelSharingRules[Model Sharing Rules]
        
        PriorityRules --> QueueManager
        CachingPolicy --> ModelLoader
        ModelSharingRules --> LoadBalancer
    end
```

## Mobile Client Architecture

```mermaid
graph TD
    MobileApp[Mobile Application] --> |Authentication| AuthService[Authentication Service]
    MobileApp --> |API Requests| APIGateway[API Gateway]
    
    subgraph "Mobile Components"
        VoiceInput[Voice Input]
        TextChat[Text Chat Interface]
        DeviceControls[Device Controls]
        KnowledgeSearch[Knowledge Search]
        
        VoiceInput --> MobileApp
        TextChat --> MobileApp
        DeviceControls --> MobileApp
        KnowledgeSearch --> MobileApp
    end
    
    APIGateway --> OV[OllamaVoice API]
    APIGateway --> OHC[OllamaHomeControl API]
    APIGateway --> OH[OllamaHub API]
    
    subgraph "Security Layer"
        AuthService --> TokenManager[Token Manager]
        TokenManager --> PermissionEngine[Permission Engine]
        PermissionEngine --> APIGateway
    end
    
    subgraph "Offline Capabilities"
        LocalCache[Local Cache]
        QueuedCommands[Queued Commands]
        
        MobileApp <--> LocalCache
        MobileApp --> QueuedCommands
        QueuedCommands --> APIGateway
    end
```

## Integration Points Specification

### OllamaVoice to OllamaHomeControl

```json
{
  "interface_name": "voice_device_control",
  "direction": "OllamaVoice → OllamaHomeControl",
  "request_format": {
    "transcript": "Turn on the living room lights",
    "intent": "device_control",
    "confidence": 0.92,
    "parameters": {
      "device": "living_room_lights",
      "action": "turn_on",
      "modifiers": {
        "brightness": null,
        "color": null
      }
    },
    "context": {
      "user_id": "user_123",
      "location": "living_room",
      "timestamp": "2023-09-15T14:32:10Z"
    }
  },
  "response_format": {
    "status": "success",
    "action_performed": "turn_on",
    "device": "living_room_lights",
    "message": "Living room lights turned on",
    "details": {
      "current_state": {
        "power": "on",
        "brightness": 0.8,
        "color": "warm_white"
      }
    }
  }
}
```

### OllamaHomeControl to OllamaHub

```json
{
  "interface_name": "device_knowledge_query",
  "direction": "OllamaHomeControl → OllamaHub",
  "request_format": {
    "query": "What's the optimal temperature for bedroom at night?",
    "context": {
      "room": "bedroom",
      "time_of_day": "night",
      "current_temperature": 72,
      "user_id": "user_123"
    }
  },
  "response_format": {
    "answer": "Based on sleep research and your preferences, the optimal bedroom temperature at night is between 65-68°F (18-20°C). I've noticed you typically set your bedroom to 67°F before sleep.",
    "confidence": 0.89,
    "sources": [
      {
        "document_id": "sleep_research_2023",
        "relevance": 0.92
      },
      {
        "document_id": "user_preferences",
        "relevance": 0.95
      }
    ],
    "suggested_actions": [
      {
        "action": "set_temperature",
        "parameters": {
          "device": "bedroom_thermostat",
          "value": 67
        }
      }
    ]
  }
}
```

## Physical Deployment Architecture

```mermaid
graph TD
    subgraph "User Devices"
        MobileApp[Mobile App]
        VoiceAssistant[Voice Assistant Hardware]
        WebInterface[Web Interface]
    end
    
    subgraph "Home Server"
        HomeServer[Home Server]
        OllamaEngine[Ollama Engine]
        CoreApps[Core Applications]
        LocalStorage[(Local Storage)]
        
        HomeServer --> OllamaEngine
        HomeServer --> CoreApps
        CoreApps --> LocalStorage
        OllamaEngine --> LocalStorage
    end
    
    subgraph "Smart Home Devices"
        Lights[Smart Lights]
        Thermostat[Smart Thermostat]
        Speakers[Smart Speakers]
        SecuritySystem[Security System]
    end
    
    MobileApp --> |WiFi/4G| HomeServer
    VoiceAssistant --> |WiFi| HomeServer
    WebInterface --> |WiFi| HomeServer
    
    HomeServer --> |Zigbee/Z-Wave/WiFi| Lights
    HomeServer --> |Zigbee/Z-Wave/WiFi| Thermostat
    HomeServer --> |WiFi| Speakers
    HomeServer --> |WiFi| SecuritySystem
    
    subgraph "Optional Cloud Components"
        CloudBackup[(Cloud Backup)]
        RemoteAccess[Remote Access Service]
        
        HomeServer -.-> |Optional| CloudBackup
        HomeServer -.-> |Optional| RemoteAccess
        MobileApp -.-> |Away from home| RemoteAccess
    end
    
    class HomeServer,OllamaEngine,CoreApps fill:#f9f,stroke:#333,stroke-width:2px;
    class MobileApp,VoiceAssistant,WebInterface fill:#bbf,stroke:#333,stroke-width:1px;
    class Lights,Thermostat,Speakers,SecuritySystem fill:#bfb,stroke:#333,stroke-width:1px;
```

## Development Environment Architecture

```mermaid
graph TD
    subgraph "Development Tools"
        IDE[Development IDE]
        GitRepo[Git Repository]
        CISystem[CI/CD Pipeline]
        DocSystem[Documentation System]
    end
    
    subgraph "Testing Environment"
        TestRunner[Test Runner]
        IntegrationTests[Integration Tests]
        MockServices[Mock Services]
        TestData[(Test Data)]
    end
    
    subgraph "Shared Development Components"
        SharedLibs[Shared Libraries]
        APISpecs[API Specifications]
        DevModels[Development Models]
    end
    
    Developer((Developer)) --> IDE
    IDE --> GitRepo
    GitRepo --> CISystem
    CISystem --> TestRunner
    
    TestRunner --> IntegrationTests
    IntegrationTests --> MockServices
    MockServices --> TestData
    
    Developer --> SharedLibs
    Developer --> APISpecs
    IDE --> DevModels
    
    CISystem --> DocSystem
    APISpecs --> DocSystem
``` 