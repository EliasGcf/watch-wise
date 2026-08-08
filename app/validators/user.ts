import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})

/**
 * Validator to use when updating a user's username.
 */
export const updateUsernameValidator = vine.create({
  username: vine
    .string()
    .trim()
    .toLowerCase()
    .minLength(3)
    .maxLength(32)
    .regex(/^[a-z0-9_]+$/)
    .unique({
      table: 'users',
      column: 'username',
      filter: (query, _value, field) => query.whereNot('id', field.meta.userId),
    })
    .optional(),
})
