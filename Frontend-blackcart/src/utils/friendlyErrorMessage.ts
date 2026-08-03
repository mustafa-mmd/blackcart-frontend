interface FriendlyErrorOptions {
  status?: number
  fallback?: string
}

const DEFAULT_ERROR_MESSAGE = 'We could not complete this action. Please check your information and try again.'

const extractDuplicateValue = (message: string): string | undefined =>
  message.match(/(?:dup key|duplicate key)[\s\S]*?\{[^:]+:\s*["']([^"']+)["']/i)?.[1]
  || message.match(/\{\s*\w+\s*:\s*["']([^"']+)["']/i)?.[1]

const extractDuplicateField = (message: string): string | undefined => {
  const indexField = message.match(/index:\s+([a-zA-Z][\w]*)_\d+/i)?.[1]
  if (indexField) return indexField
  return message.match(/\{\s*([a-zA-Z][\w]*)\s*:/)?.[1]
}

const duplicateMessage = (message: string): string => {
  const field = extractDuplicateField(message)?.toLowerCase()
  const value = extractDuplicateValue(message)

  if (field === 'sku' || /\bsku\b/i.test(message)) {
    return value
      ? `The SKU "${value}" is already in use. Enter a different SKU or edit the existing product.`
      : 'This SKU is already in use. Enter a different SKU or edit the existing product.'
  }

  if (field === 'email' || /\bemail\b/i.test(message)) {
    return 'This email address is already registered. Use a different email or sign in to the existing account.'
  }

  if (field === 'slug' || field === 'name') {
    return 'An item with this name already exists. Use a different name or edit the existing item.'
  }

  return 'An item with these details already exists. Check the information and try again.'
}

export const getFriendlyErrorMessage = (
  errorOrMessage: unknown,
  options: FriendlyErrorOptions = {},
): string => {
  const fallback = options.fallback || DEFAULT_ERROR_MESSAGE
  const message = (
    errorOrMessage instanceof Error
      ? errorOrMessage.message
      : typeof errorOrMessage === 'string'
        ? errorOrMessage
        : ''
  ).trim()

  if (/E11000|duplicate key|MongoServerError.*11000/i.test(message)) {
    return duplicateMessage(message)
  }

  if (/sku already exists|duplicate sku/i.test(message)) {
    return 'This SKU is already in use. Enter a different SKU or edit the existing product.'
  }

  if (/Cast to ObjectId failed|BSONError|invalid ObjectId/i.test(message)) {
    return 'The selected item is invalid or no longer available. Refresh the page and try again.'
  }

  if (/ECONNABORTED|timeout(?: of \d+ms)? exceeded/i.test(message)) {
    return 'The request took too long. Check your connection and try again.'
  }

  if (/Network Error|ERR_NETWORK|Failed to fetch/i.test(message)) {
    return 'Unable to connect to the server. Check your internet connection and try again.'
  }

  switch (options.status) {
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return message && !/^Request failed with status code/i.test(message)
        ? message
        : 'The requested item could not be found.'
    case 409:
      return message && !/^Request failed with status code/i.test(message)
        ? message
        : 'This information conflicts with an existing record. Check the details and try again.'
    case 413:
      return 'The uploaded file is too large. Choose a smaller file and try again.'
    case 415:
      return 'This file type is not supported. Choose a valid image file and try again.'
    case 422:
      return message && !/^Request failed with status code/i.test(message)
        ? message
        : 'Some information is invalid. Check the highlighted fields and try again.'
    case 429:
      return 'Too many attempts were made. Please wait a moment and try again.'
  }

  const looksTechnical = /(?:Mongo(?:Server)?Error|MongooseError|ValidationError:|TypeError:|ReferenceError:|SyntaxError:|collection:|\bat\s+\S+\s+\(|\bindex:\s+\w+_\d+|Request failed with status code \d+)/i.test(message)
  if (!message || looksTechnical) return fallback

  return message
}
