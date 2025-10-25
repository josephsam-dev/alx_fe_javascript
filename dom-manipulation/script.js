// Array to store quotes
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Inspiration" },
];

// Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteText").textContent = `"${quote.text}"`;
  document.getElementById("quoteCategory").textContent = `Category: ${quote.category}`;
}

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add to array
  quotes.push({ text: newText, category: newCategory });

  // Clear form inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("New quote added successfully!");
}
