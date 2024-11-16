import { IRequest } from 'itty-router'
import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { parseNameFromDb } from './functions/utils'
import zod from 'zod'

export async function getNameForAddress(request: IRequest, env: Env) {
    const schema = zod.object({
        address: zod.string().regex(/^0x[a-fA-F0-9]{40}$/),
        })
        const safeParse = schema.safeParse(request.params)

        if (!safeParse.success) {
        const response = { error: safeParse.error }
        return Response.json(response, { status: 400 })
        }

    const { address } = safeParse.data

  const db = createKysely(env)
  const names = await db.selectFrom('names').selectAll().where('owner', '=', address).execute()
  const parsedNames = parseNameFromDb(names)

  // Simplify the response format
  const formattedNames = parsedNames.reduce((acc, name) => {
    return {
      ...acc,
      [name.name]: {
        addresses: name.addresses,
        texts: name.texts,
        contenthash: name.contenthash,
      },
    }
  }, {})

  return Response.json(formattedNames, {
    status: 200,
  })
}
