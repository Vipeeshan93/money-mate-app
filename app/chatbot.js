
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";
import { getUser } from "./session";

export default function Chatbot() {

const [userId,setUserId] = useState(null);
const [username,setUsername] = useState("");
const [messages,setMessages] = useState([]);

const [transactions,setTransactions] = useState([]);
const [budgets,setBudgets] = useState([]);

const [loading,setLoading] = useState(false);
const [loadingMessage,setLoadingMessage] = useState("");

const [menu,setMenu] = useState("main");
const [userInput, setUserInput] = useState("");


const mainMenu = ["1. Income","2. Expense","3. Balance","4. Budget","5. AI Insights"];
const incomeMenu = ["⬅ Back to Main Menu","1.1 Total Income for Month","1.2 Category-wise Income","1.3 Previous Month Income"];
const expenseMenu = ["⬅ Back to Main Menu","2.1 Total Expense for Month","2.2 Category-wise Expense","2.3 Previous Month Expense"];
const balanceMenu = ["⬅ Back to Main Menu","3.1 Balance for Month","3.2 Previous Month Balance"];
const budgetMenu = ["⬅ Back to Main Menu","4.1 Budget Realignment"];
const aiMenu = ["⬅ Back to Main Menu","5.1 Personalized Financial Advice","5.2 Financial Health Score"];

// GET USER
useEffect(()=>{
let currentUser=null;
const interval=setInterval(()=>{
const user=getUser();
if(user && user!==currentUser){
currentUser=user;
setUserId(user);
clearInterval(interval);
}
},300);
return()=>clearInterval(interval);
},[]);


const loadUser=async()=>{
const snap=await getDoc(doc(db,"users",userId));
if(snap.exists()){
const data=snap.data();
setUsername(data.firstName+" "+data.lastName);
}
};


const loadTransactions=async()=>{
let list=[];
const snapshot=await getDocs(collection(db,"users",userId,"transactions"));
snapshot.forEach((doc)=> list.push(doc.data()));
setTransactions(list);
};

const loadBudgets=async()=>{
let list=[];
const snapshot=await getDocs(collection(db,"users",userId,"budgets"));
snapshot.forEach((doc)=>{
const data=doc.data();
list.push({title:data.title,type:data.type,maxAmount:data.maxAmount});
});
setBudgets(list);
};

useEffect(()=>{
if(!userId) return;
loadUser();
loadTransactions();
loadBudgets();
},[userId]);

useEffect(()=>{
if(username){
setMessages([
{sender:"bot",text:`Hello ${username} 👋`},
{sender:"bot",text:"How can I assist you today?"}
]);
}
},[username]);


const getCurrentMonthTransactions = () => {
const now = new Date();
const m = now.getMonth();
const y = now.getFullYear();

return transactions.filter(t=>{
if(!t.date) return false;

let d;
if(t.date && typeof t.date === "object" && t.date.seconds){
d = new Date(t.date.seconds * 1000);
}else{
d = new Date(t.date);
}

return d.getMonth()===m && d.getFullYear()===y;
});
};

const getPreviousMonthTransactions = () => {
const now = new Date();
const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

const m = prevDate.getMonth();
const y = prevDate.getFullYear();

return transactions.filter(t=>{
if(!t.date) return false;

let d;
if(t.date && typeof t.date === "object" && t.date.seconds){
d = new Date(t.date.seconds * 1000);
}else{
d = new Date(t.date);
}

return d.getMonth()===m && d.getFullYear()===y;
});
};

// AI CALL
const askAI=async(prompt)=>{
try{
const res=await axios.post(
"https://api.openai.com/v1/chat/completions",
{
model:"gpt-4o-mini",
messages:[
{role:"system",content:"You are a financial advisor."},
{role:"user",content:prompt}
]
},
{
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "
}
}
);
return res.data.choices[0].message.content;
}catch{
return "AI service unavailable.";
}
};

// FINANCIAL HEALTH
const calculateFinancialHealth=()=>{
let score=100;
const currentTx = getCurrentMonthTransactions();

const income=currentTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const expense=currentTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

const savings=income-expense;

if(savings<=0) score-=40;
else if(savings<income*0.1) score-=20;

budgets.forEach(b=>{
const actual=currentTx.filter(t=>t.title===b.title).reduce((s,t)=>s+Number(t.amount),0);
if(actual>b.maxAmount) score-=10;
});

return score<0?0:score;
};

// HANDLE OPTION
const handleOption=async(option)=>{

setMessages(prev=>[...prev,{sender:"user",text:option}]);

if(option==="⬅ Back to Main Menu"){ setMenu("main"); return;}
if(option==="1. Income"){ setMenu("income"); return;}
if(option==="2. Expense"){ setMenu("expense"); return;}
if(option==="3. Balance"){ setMenu("balance"); return;}
if(option==="4. Budget"){ setMenu("budget"); return;}
if(option==="5. AI Insights"){ setMenu("ai"); return;}

setLoading(true);
let reply="";

const currentTx = getCurrentMonthTransactions();
const prevTx = getPreviousMonthTransactions();
const allTx = transactions;

// TOTALS
const totalIncome=currentTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const totalExpense=currentTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

// INCOME
if(option==="1.1 Total Income for Month") reply=`💰 LKR ${totalIncome}`;

// EXPENSE
if(option==="2.1 Total Expense for Month") reply=`🧾 LKR ${totalExpense}`;

// BALANCE
if(option==="3.1 Balance for Month") reply=`📊 LKR ${totalIncome-totalExpense}`;

// CATEGORY INCOME
if(option==="1.2 Category-wise Income"){
const cat={};
currentTx.forEach(t=>{
if(t.type==="income"){
cat[t.title]=(cat[t.title]||0)+Number(t.amount);
}});
reply="💰 Income\n\n"+Object.entries(cat).map(([k,v])=>`${k}: ${v}`).join("\n");
}

// CATEGORY EXPENSE
if(option==="2.2 Category-wise Expense"){
const cat={};
currentTx.forEach(t=>{
if(t.type==="expense"){
cat[t.title]=(cat[t.title]||0)+Number(t.amount);
}});
reply="🧾 Expense\n\n"+Object.entries(cat).map(([k,v])=>`${k}: ${v}`).join("\n");
}

// PREVIOUS
if(option==="1.3 Previous Month Income"){
const total=prevTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
reply=`💰 ${total}`;
}

if(option==="2.3 Previous Month Expense"){
const total=prevTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
reply=`🧾 ${total}`;
}

if(option==="3.2 Previous Month Balance"){
const inc=prevTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const exp=prevTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
reply=`📊 ${inc-exp}`;
}

// BUDGET REALIGNMENT (CURRENT MONTH ONLY)
if(option==="4.1 Budget Realignment"){

setLoadingMessage("🤔 Analyzing this month's budget...");

const spending={};

currentTx.forEach(t=>{
if(t.type!=="expense") return;
spending[t.title]=(spending[t.title]||0)+Number(t.amount);
});

const analysis=budgets.map(b=>({
category:b.title,
budget:b.maxAmount,
actual:spending[b.title]||0,
difference:(spending[b.title]||0)-b.maxAmount
}));

const prompt=`
You are a financial budgeting assistant.

This is the CURRENT MONTH budget vs actual:

${JSON.stringify(analysis)}

IMPORTANT RULES:
- ONLY consider EXPENSE categories
- DO NOT use income categories for reallocation
- Reallocation must happen ONLY between expense categories

Your task:

1. Identify expense categories that EXCEEDED the budget
2. Show how much each category exceeded (LKR)
3. Identify expense categories with UNUSED budget
4. Show remaining amount in each category (LKR)
5. Suggest reallocation ONLY from unused expense categories to overspent expense categories

Rules:
- Never suggest moving money from income
- Only use expense categories for redistribution
- Always include exact LKR amounts
- Use bullet points
- Keep response clear and practical

Example:
- Food exceeded by LKR 2000
- Transport has unused LKR 1500
→ Move LKR 1500 from Transport to Food

Provide final recommendations.
`;

reply=await askAI(prompt);
}

// PERSONAL FINANCIAL ADVICE (UPDATED)
if(option==="5.1 Personalized Financial Advice"){

setLoadingMessage("🤖 Thinking...");

// ALL TIME
const totalIncomeAll = allTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const totalExpenseAll = allTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

// CURRENT
const currentIncome = currentTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const currentExpense = currentTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

// PREVIOUS
const prevIncome = prevTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const prevExpense = prevTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

const prompt = `
ALL TIME Income: ${totalIncomeAll}
ALL TIME Expense: ${totalExpenseAll}

CURRENT MONTH Income: ${currentIncome}
CURRENT MONTH Expense: ${currentExpense}

PREVIOUS MONTH Income: ${prevIncome}
PREVIOUS MONTH Expense: ${prevExpense}

Give insights, compare months, and suggest improvements.
`;

reply = await askAI(prompt);
}

// HEALTH SCORE
if(option==="5.2 Financial Health Score"){
reply=`📊 Score: ${calculateFinancialHealth()}/100`;
}

setLoading(false);
setMessages(prev=>[...prev,{sender:"bot",text:reply}]);
};

// USER INPUT HANDLER (UPDATED)
const handleUserQuestion = async () => {

if (!userInput.trim()) return;

setMessages(prev => [...prev, { sender: "user", text: userInput }]);

setLoading(true);
setLoadingMessage("🤖 Thinking...");

const allTx = transactions;
const currentTx = getCurrentMonthTransactions();
const prevTx = getPreviousMonthTransactions();

const totalIncomeAll = allTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const totalExpenseAll = allTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

const currentIncome = currentTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
const currentExpense = currentTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

const prompt = `
User Question: ${userInput}

ALL TIME:
Income: ${totalIncomeAll}
Expense: ${totalExpenseAll}

CURRENT MONTH:
Income: ${currentIncome}
Expense: ${currentExpense}

PREVIOUS MONTH:
Income: ${prevTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0)}
Expense: ${prevTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0)}

Answer based on user question.
`;

const reply = await askAI(prompt);

setLoading(false);
setMessages(prev => [...prev, { sender: "bot", text: reply }]);

setUserInput("");
};

// UI
return(
<View style={styles.container}>
<ScrollView style={{flex:1}}>
{messages.map((msg,i)=>(
<View key={i} style={{
alignSelf: msg.sender==="bot"?"flex-start":"flex-end",
backgroundColor: msg.sender==="bot"?"#eee":"#4CAF50",
padding:10,marginVertical:5,borderRadius:10,maxWidth:"80%"
}}>
<Text style={{color: msg.sender==="bot"?"#000":"#fff"}}>{msg.text}</Text>
</View>
))}
{loading && (
<View style={{padding:10}}>
<Text>{loadingMessage}</Text>
</View>
)}
</ScrollView>

<View style={{ flexDirection: "row", marginBottom: 10 }}>
<TextInput value={userInput} onChangeText={setUserInput} placeholder="Ask anything..." style={{ flex:1,borderWidth:1,borderColor:"#ccc",borderRadius:8,padding:10 }}/>
<TouchableOpacity onPress={handleUserQuestion} style={{ backgroundColor:"#4CAF50",padding:10,marginLeft:5,borderRadius:8 }}>
<Text style={{ color:"#fff" }}>Send</Text>
</TouchableOpacity>
</View>

<View>
{(menu==="main"?mainMenu:
menu==="income"?incomeMenu:
menu==="expense"?expenseMenu:
menu==="balance"?balanceMenu:
menu==="budget"?budgetMenu:aiMenu
).map((item,i)=>(
<TouchableOpacity key={i} onPress={()=>handleOption(item)} style={styles.btn}>
<Text>{item}</Text>
</TouchableOpacity>
))}
</View>
</View>
);
}

const styles = StyleSheet.create({
container:{flex:1,padding:20},
btn:{backgroundColor:"#ddd",padding:12,marginVertical:5,borderRadius:8}
});


