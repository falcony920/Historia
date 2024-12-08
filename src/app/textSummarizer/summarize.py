from transformers import pipeline
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

model_name = "facebook/bart-large-cnn"

# Force re-download of model and tokenizer
model = AutoModelForSeq2SeqLM.from_pretrained(model_name, force_download=True)
tokenizer = AutoTokenizer.from_pretrained(model_name, force_download=True)


def summarize_text(text, model_name="facebook/bart-large-cnn", max_length=130, min_length=30, length_penalty=2.0, do_sample=False):
    """
    Summarizes the input text using a Hugging Face summarization model.

    Parameters:
    - text (str): The text to summarize.
    - model_name (str): The name of the Hugging Face model to use.
    - max_length (int): The maximum length of the summary.
    - min_length (int): The minimum length of the summary.
    - length_penalty (float): Penalizes long sentences (higher value = shorter summaries).
    - do_sample (bool): Whether or not to use sampling; if False, greedy decoding is used.

    Returns:
    - summary (str): The summarized text.
    """
    # Load the summarization pipeline
    summarizer = pipeline("summarization", model=model_name)
    
    # Generate the summary
    summary = summarizer(
        text,
        max_length=max_length,
        min_length=min_length,
        length_penalty=length_penalty,
        do_sample=do_sample
    )
    return summary[0]['summary_text']

# Example usage
if __name__ == "__main__":
    # Input text
    input_text = """
    The rapid advancements in artificial intelligence (AI) and machine learning (ML) are revolutionizing many industries, from healthcare and finance to retail and manufacturing. 
    These technologies enable machines to analyze vast amounts of data, identify patterns, and make decisions without human intervention.
    In healthcare, AI is used to assist doctors in diagnosing diseases, predicting patient outcomes, and personalizing treatment plans.
    In finance, AI-driven algorithms help detect fraudulent transactions, optimize investment portfolios, and improve customer service through chatbots.
    However, with the rise of AI and ML, there are also concerns about job displacement, data privacy, and ethical implications.
    As AI continues to evolve, it is essential to balance innovation with responsible implementation to ensure it benefits society as a whole.
    """
    
    # Summarize the text
    summary = summarize_text(input_text)
    print("Summary:")
    print(summary)
