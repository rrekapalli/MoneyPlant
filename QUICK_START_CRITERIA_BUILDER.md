# Quick Start: Criteria Builder

## 🚀 Get Started in 3 Steps

### Step 1: Build the Query Builder Library
```bash
cd frontend
npm run build:querybuilder
```

### Step 2: Start the Development Server
```bash
npm start
```

### Step 3: Navigate to Screeners
Open your browser and go to:
```
http://localhost:8080/screeners
```

## 🎯 Using the Criteria Builder

### Create Your First Screening Rule

1. **Select or Create a Screener**
   - Click on an existing screener from the list, OR
   - Click the green "+ Create Screener" button

2. **Go to Configure Tab**
   - Click the "Configure" tab at the top

3. **Add a Rule**
   - Look for the "Screening Criteria" section
   - Click the green **"+ Rule"** button
   - You'll see three dropdowns:
     - **Field**: Select what to filter (e.g., "Market Cap")
     - **Operator**: Select comparison (e.g., ">")
     - **Value**: Enter the value (e.g., "1000")

4. **Add More Rules**
   - Click **"+ Rule"** again to add another condition
   - All rules are combined with AND/OR logic

5. **Add a Group (Optional)**
   - Click the blue **"+ Group"** button for complex logic
   - Groups can contain multiple rules with their own AND/OR condition

6. **Save Your Screener**
   - Click the **"Save Changes"** button at the bottom

## 📋 Example: Find Quality Stocks

Let's create a screener for quality stocks with good fundamentals:

```
AND
  + Rule: Market Cap > 1000 (Crores)
  + Rule: P/E Ratio < 25
  + Rule: Debt to Equity < 1
  + Group (OR)
      + Rule: ROE > 15%
      + Rule: Dividend Yield > 2%
```

### How to Build This:

1. Click **"+ Rule"**
   - Field: Market Cap
   - Operator: >
   - Value: 1000

2. Click **"+ Rule"**
   - Field: P/E Ratio
   - Operator: <
   - Value: 25

3. Click **"+ Rule"**
   - Field: Debt to Equity
   - Operator: <
   - Value: 1

4. Click **"+ Group"**
   - Change condition to "OR"
   - Inside the group, click **"+ Rule"**
     - Field: ROE
     - Operator: >
     - Value: 15
   - Click **"+ Rule"** again
     - Field: Dividend Yield
     - Operator: >
     - Value: 2

5. Click **"Save Changes"**

## 🎨 Visual Guide

### What You Should See:

```
┌─────────────────────────────────────────────────────┐
│ Screening Criteria                                  │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ [AND ▼]  [+ Rule]  [+ Group]                   │ │
│ │         (green)    (blue)                       │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Button Colors:
- 🟢 **+ Rule** = Green button
- 🔵 **+ Group** = Blue button
- 🔴 **X** = Red remove button

## ⚡ Quick Tips

### Keyboard Shortcuts (Coming Soon)
- `Ctrl + R` - Add Rule
- `Ctrl + G` - Add Group
- `Delete` - Remove selected rule

### Best Practices
1. **Start Simple**: Begin with 2-3 rules, then add complexity
2. **Use Groups**: Group related conditions together
3. **Test Often**: Save and test your screener frequently
4. **Name Clearly**: Give your screener a descriptive name

### Common Patterns

#### Value Stocks
```
AND
  + P/E Ratio < 15
  + P/B Ratio < 1.5
  + Dividend Yield > 3%
```

#### Growth Stocks
```
AND
  + Revenue Growth > 20%
  + Profit Growth > 25%
  + ROE > 20%
```

#### Momentum Stocks
```
AND
  + Price Change (1M) > 10%
  + Volume > Average Volume
  + RSI > 60
```

## 🐛 Troubleshooting

### Can't See Buttons?
1. Refresh the page (F5)
2. Clear browser cache (Ctrl + Shift + Delete)
3. Check browser console for errors (F12)

### Buttons Not Working?
1. Make sure you clicked "Configure" tab
2. Verify you have a screener selected
3. Check if buttons are disabled (grayed out)

### Can't Save?
1. Ensure you have at least one rule
2. Check that all fields are filled
3. Verify you're logged in

## 📚 Learn More

- **Full Documentation**: See `CRITERIA_BUILDER_INTEGRATION.md`
- **UI Reference**: See `CRITERIA_BUILDER_UI_REFERENCE.md`
- **Troubleshooting**: See `CRITERIA_BUILDER_TROUBLESHOOTING.md`

## ✅ Success Checklist

- [ ] Query builder library built
- [ ] Dev server running
- [ ] Can see green "+ Rule" button
- [ ] Can see blue "+ Group" button
- [ ] Can add a rule
- [ ] Can select field, operator, value
- [ ] Can remove a rule
- [ ] Can add a group
- [ ] Can save screener
- [ ] Criteria persists after reload

## 🎉 You're Ready!

Start creating powerful stock screeners with complex criteria. Happy screening! 🚀

---

**Need Help?** Check the troubleshooting guide or open an issue on GitHub.
