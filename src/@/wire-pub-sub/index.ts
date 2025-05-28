// @ts-nocheck

export const childContract = initContract({
  someTopic: {
    params: p.obj({
      id: p.str,
    }),
  },
})

export const contract = initContract({
  someTopic: {
    params: p.obj({
      id: p.str,
    }),
    msg: p.obj({
      name: p.str,
    }),
  },
  child: childContract,
})

export const client = initClient(contract)

client.someTopic.publish({ id: '123' }, { name: 'John' })

client.someTopic.sub({ id: '123' }).subscribe(console.log)

client.child.someTopic.publish({ id: '123' }, { name: 'John' })

client.child.someTopic.sub({ id: '123' }).subscribe(console.log)
