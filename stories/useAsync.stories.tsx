import React from 'react'
import { Meta, Story } from '@storybook/react'
import { useAsync } from '../src'

interface Post {
  id: number
  title: string
  body: string
  userId: number
}

function Sandbox({ postId = 1 }) {
  const { data, error, status, run } = useAsync<Post>()

  React.useEffect(() => {
    run(async () => {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${postId}`,
      )

      const data = (await response.json()) as Post

      if (!response.ok) {
        throw new Error(`Failed to fetch post: #${postId}.`)
      }

      return data
    })
  }, [postId, run])

  return status === 'idle' || status === 'pending' ? (
    <div>loading</div>
  ) : status === 'rejected' ? (
    <div>Failed to fetch post: {postId}</div>
  ) : (
    <>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
    </>
  )
}

const meta: Meta = {
  title: 'Welcome',
  component: Sandbox,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<{}> = args => <Sandbox {...args} />

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

Default.args = {}
