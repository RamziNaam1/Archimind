import os
import torch
import argparse
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

def main():
    parser = argparse.ArgumentParser(description="Merge LoRA weights and prepare for GGUF conversion")
    parser.add_argument("--base_model", type=str, default="meta-llama/Meta-Llama-3-8B-Instruct", help="Base model ID")
    parser.add_argument("--adapter_dir", type=str, default="./llama3-mermaid-uml", help="Directory where adapter is saved")
    parser.add_argument("--output_dir", type=str, default="./llama3-mermaid-merged", help="Directory to save merged model")
    args = parser.parse_args()

    if not os.path.exists(args.adapter_dir):
        raise FileNotFoundError(f"Adapter directory not found: {args.adapter_dir}")

    print(f"Loading base model: {args.base_model}")
    base_model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        torch_dtype=torch.float16,
        device_map="cpu"  # Merge on CPU to avoid GPU OOM for 8B model
    )

    print(f"Loading adapter: {args.adapter_dir}")
    model = PeftModel.from_pretrained(base_model, args.adapter_dir)

    print("Merging weights (this may take a few minutes)...")
    merged_model = model.merge_and_unload()

    print(f"Saving merged model to: {args.output_dir}")
    merged_model.save_pretrained(args.output_dir)

    print("Saving tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model)
    tokenizer.save_pretrained(args.output_dir)

    print("\n✅ Success! Merged model saved.")
    print("\nTo convert the merged model to GGUF format for llama.cpp / Ollama:")
    print("1. Clone the llama.cpp repository:")
    print("   git clone https://github.com/ggerganov/llama.cpp.git")
    print("2. Install llama.cpp requirements:")
    print("   pip install -r llama.cpp/requirements.txt")
    print("3. Run the Hugging Face to GGUF converter script:")
    print(f"   python llama.cpp/convert_hf_to_gguf.py {args.output_dir} --outtype f16 --outfile {args.output_dir}/llama3-mermaid-f16.gguf")

if __name__ == "__main__":
    main()
