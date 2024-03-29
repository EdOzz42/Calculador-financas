const Modal =  {
    open(){
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },  
    close(){
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finance:transaction")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finance:transaction", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        let income = 0
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    expenses() {
        let expense = 0
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    }, 
    total() {
        let total = 0 
        total = Transaction.incomes() + Transaction.expenses()
        return total
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transactions, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transactions, index) {
        const CSSClass = transactions.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transactions.amount)
        const HTML = `
            <td class="description">${transactions.description}</td>
            <td class=${CSSClass}>${amount}</td>
            <td class="date">${transactions.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" class="transaction-remove" alt="Remover transação"></td>
        `

        return HTML
    },

    updateBalance() {
        const incomes = Transaction.incomes()
        const expenses = Transaction.expenses()
        const total = Transaction.total()

        document
            .querySelector('#incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        
        document
            .querySelector('#expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
    
        document
            .querySelector('#totalDisplay')
            .innerHTML = Utils.formatCurrency(total)
        
        Utils.formatColorTotalCard(total)
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "+"
        value = String(value).replace(/\D/g, "")
        value = Number(value/100)
        value = value.toLocaleString('pt-BR', {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },
    formatAmount(value) {
        value = Number(value) * 100
        return Math.round(value)
    },
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatColorTotalCard(value){
        const ValueToChangeColor = Number(value)
        if (ValueToChangeColor === 0){
            document.querySelector('.card.total').classList.remove('positive')
            document.querySelector('.card.total').classList.remove('negative')
            document.querySelector('.card.total').classList.add('neutral')    
        } 
        else if (ValueToChangeColor > 0){
            document.querySelector('.card.total').classList.remove('neutral')
            document.querySelector('.card.total').classList.remove('negative')
            document.querySelector('.card.total').classList.add('positive')
        }
        else {
            document.querySelector('.card.total').classList.remove('positive')
            document.querySelector('.card.total').classList.remove('neutral')
            document.querySelector('.card.total').classList.add('negative')
        }
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    validateFilds() {
        const {description, amount, date} = Form.getValues()
        if(description.trim() == "" || amount.trim() == "" || date.trim() == "") {
            throw new Error("Preencha todos os campos")
        }
    },
    formatData(){
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)     
        return {
            description,
            amount,
            date
        }
    },
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value        
        }
    },
    save(transaction) {
        Transaction.add(transaction)
    },
    clearFilds() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFilds()
            const transaction = Form.formatData()
            Form.save(transaction)
            Form.clearFilds()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }

        Form.validateFilds()
    }
}

const App = {
    init() {       
        Transaction.all.forEach(DOM.addTransaction)   
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
