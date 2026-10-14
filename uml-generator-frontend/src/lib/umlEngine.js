// 🧠 SMART UML ENGINE (Frontend version)

export function generateSmartUML(prompt, type = 'classDiagram') {
  if (!prompt) return ''

  const text = prompt.toLowerCase()

  const entities = extractEntities(text)
  const relationships = extractRelationships(text, entities)
  const attributes = generateAttributes(entities)

  return buildMermaid(type, entities, relationships, attributes)
}

// ----------------------
// ENTITY DETECTION
// ----------------------
function extractEntities(text) {
  const keywords = [
    'user', 'account', 'transaction', 'loan', 'admin',
    'order', 'product', 'payment', 'cart', 'message'
  ]

  return keywords.filter(k => text.includes(k))
}

// ----------------------
// RELATIONSHIPS
// ----------------------
function extractRelationships(text, entities) {
  const relations = []

  if (text.includes('multiple') || text.includes('many')) {
    if (entities.includes('user') && entities.includes('account')) {
      relations.push(`User "1" --> "many" BankAccount`)
    }
    if (entities.includes('account') && entities.includes('transaction')) {
      relations.push(`BankAccount "1" --> "many" Transaction`)
    }
    if (entities.includes('user') && entities.includes('loan')) {
      relations.push(`User "1" --> "many" Loan`)
    }
  }

  if (entities.includes('admin') && entities.includes('loan')) {
    relations.push(`Admin --> Loan`)
  }

  if (entities.includes('admin') && entities.includes('user')) {
    relations.push(`Admin --> User`)
  }

  return relations
}

// ----------------------
// ATTRIBUTES
// ----------------------
function generateAttributes(entities) {
  const map = {}

  entities.forEach(entity => {
    switch (entity) {
      case 'user':
        map.User = `
    +String id
    +String name
    +String email
    +login()
        `
        break

      case 'account':
        map.BankAccount = `
    +String accountNumber
    +float balance
    +deposit(amount)
    +withdraw(amount)
        `
        break

      case 'transaction':
        map.Transaction = `
    +String id
    +float amount
    +String type
    +Date date
        `
        break

      case 'loan':
        map.Loan = `
    +String id
    +float amount
    +String status
    +request()
        `
        break

      case 'admin':
        map.Admin = `
    +approveLoan()
    +rejectLoan()
        `
        break
    }
  })

  return map
}

// ----------------------
// MERMAID BUILDER
// ----------------------
function buildMermaid(type, entities, relations, attributes) {
  if (type !== 'classDiagram') {
    return `classDiagram\n  %% Only classDiagram supported in smart mode for now`
  }

  let code = `classDiagram\n`

  Object.entries(attributes).forEach(([name, body]) => {
    code += `  class ${name} {${body}\n  }\n`
  })

  relations.forEach(r => {
    code += `  ${r}\n`
  })

  return code
}