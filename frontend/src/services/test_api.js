import { api } from "./api.js"

async function test() {
  const res = await api.explain([1, 2, 3, 4, 5], 1)
  console.log(res)
}

test()