import PostCard from './PostCard'

export default function PostList({ posts }) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  )
}