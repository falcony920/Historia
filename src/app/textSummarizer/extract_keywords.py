import spacy
from collections import Counter

# Load SpaCy's English model
nlp = spacy.load("en_core_web_sm")

def extract_keywords(text, num_keywords=10):
    """
    Extracts keywords from the input text using SpaCy.

    Args:
        text (str): Input text to extract keywords from.
        num_keywords (int): Number of keywords to return.

    Returns:
        list: A list of keywords.
    """
    doc = nlp(text)

    # Filter tokens: no stopwords, punctuation, or short tokens
    tokens = [
        token.text.lower()
        for token in doc
        if not token.is_stop and not token.is_punct and len(token.text) > 2
    ]

    # Count token frequencies
    token_counts = Counter(tokens)

    # Get the most common keywords
    keywords = [word for word, _ in token_counts.most_common(num_keywords)]
    return keywords


# Example usage
if __name__ == "__main__":
    story = """
    Once upon a time in a small village, a young boy named Jack discovered a mysterious golden egg. 
    The egg glowed brightly, and strange symbols were etched into its surface. Little did Jack know 
    that the egg was the key to a hidden treasure guarded by an ancient dragon.
    """
    keywords = extract_keywords(story)
    print("Extracted Keywords:", keywords)
