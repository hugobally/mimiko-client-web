export default function({ dispatch, state }, map) {
  let level = 0
  let current = map.knots.filter(knot => knot.level === level)

  while (current.length > 0) {
    // Set parent and children for current level
    current = current.map(knot => {
      const lk = map.links.find(link => link.target === knot.id)
      knot.parent = lk ? lk.source : null
      knot.children = []
      for (const link of map.links) {
        if (link.source === knot.id) knot.children.push(link.target)
      }

      return knot
    })

    // Deploy the level
    const newLinks = map.links.filter(link =>
      current.find(knot => knot.id === link.target),
    )

    dispatch('addKnots', current)
    dispatch('addLinks', newLinks)

    // Setup next level
    level += 1

    const next = map.knots.filter(knot => knot.level === level)
    const slots = []

    // Setup possible slots for the next level
    const radius = level * 300
    const items = level === 1 ? next.length : 256
    // let items = next.length * 2 * Math.max(1, Math.round(level / 2))
    // if (items < 16) items = 16

    for (let i = 0; i < items; i++) {
      slots.push({
        x: radius * Math.cos((2 * Math.PI * i) / items),
        y: radius * Math.sin((2 * Math.PI * i) / items),
      })
    }

    // Push and position children for each parent
    for (const parent of current) {
      for (const childId of parent.children) {
        const childKnot = next.find(knot => knot.id === childId)

        const parentX = state.knots[parent.id].x
        const parentY = state.knots[parent.id].y
        const closest = { delta: null, coord: {} }
        for (const slot of slots) {
          const dx = parentX - slot.x
          const dy = parentY - slot.y
          const delta = Math.pow(dx, 2) + Math.pow(dy, 2)
          if (closest.delta === null || delta < closest.delta) {
            closest.delta = delta
            closest.coord = slot
            closest.index = slots.indexOf(slot)
          }
        }

        childKnot.x = closest.coord.x
        childKnot.y = closest.coord.y

        slots.splice(closest.index, 1)
      }
    }

    current = next
  }
}
