import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyDnohOLbb34fAKja3ZysRYDEA3O2KfwvhM")

print("Listing all models for this key:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")
