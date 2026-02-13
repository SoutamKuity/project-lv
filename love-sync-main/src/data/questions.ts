export interface Question {
  id: number;
  question: string;
  options: string[];
}

export const loveQuestions: Question[] = [
  {
    id: 1,
    question: "What’s their favourite movie genre?",
    options: ["Romance", "Action", "Comedy", "Thriller","Others"],
  },
  {
    id: 2,
    question: "What’s their favourite food?",
    options: ["Pizza", "Burger", "Biryani", "Pasta","Others"],
  },
  {
    id: 3,
    question: "What’s their favourite snack?",
    options: ["Chips", "Popcorn", "Chocolate", "Biscuits","Others"],
  },
  {
    id: 4,
    question: "What’s their favourite music genre?",
    options: ["Pop", "Rock", "Hip-hop", "Classical","Others"],
  },
  {
    id: 5,
    question: "What’s their favourite colour?",
    options: ["Red", "Blue", "Black", "White","Others"],
  },
  {
    id: 6,
    question: "What’s their favourite season?",
    options: ["Summer", "Winter", "Rainy", "Spring","Others"],
  },
  {
    id: 7,
    question: "What’s their favourite drink?",
    options: ["Tea", "Coffee", "Juice", "Soft drinks","Others"],  
  },
  {
    id: 8,
    question: "What’s their favourite dessert?",
    options: ["Ice cream", "Cake", "Chocolate", "Gulab Jamun","Others"],
  },
  {
    id: 9,
    question: "What’s their favourite hobby?",
    options: ["Reading", "Gaming", "Traveling", "Music","Others"],
  },
  {
    id: 10,
    question: "What’s their favourite place to relax?",
    options: ["Home", "Beach", "Mountains", "Café","Others"],
  },
  {
    id: 11,
    question: "What’s their favourite time of day?",
    options: ["Morning", "Afternoon", "Evening", "Night","Others"],
  },
  {
    id: 12,
    question: "What’s their favourite holiday or festival?",
    options: ["Diwali", "Christmas", "Eid", "New Year","Others"],
  },
  {
    id: 13,
    question: "What’s their favourite type of weather?",
    options: ["Sunny", "Rainy", "Cold", "Cloudy", "Others"],
  },
  {
    id: 14,
    question: "What’s their favourite type of outing?",
    options: ["Movies", "Café", "Long walk", "Shopping", "Others"],
  },
  {
    id: 15,
    question: "What’s their favourite social media app?",
    options: ["Instagram", "WhatsApp", "Snapchat", "Twitter", "Others"],
  },
];
