/** What the Round 2 code editor starts with. Comparing against it tells whether the candidate wrote anything. */
export const starterCode = `import { useState } from 'react'

// Build your solution here. The preview on the right updates as you type.
export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <button onClick={() => setCount((value) => value + 1)}>Clicked {count} times</button>
    </div>
  )
}
`
