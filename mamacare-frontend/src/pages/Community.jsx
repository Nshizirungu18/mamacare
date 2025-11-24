import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import BackButton from "../components/BackButton";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [filterBirthClub, setFilterBirthClub] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filterBirthClub ? { birthClub: filterBirthClub } : {};
      const { data } = await api.get("/forum", { params });
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts:", err.response?.data || err.message);
      setError("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  }, [filterBirthClub]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const loadComments = async (postId) => {
    try {
      const { data } = await api.get(`/forum/${postId}/comments`);
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || newPostContent.trim().length < 3) {
      setError("Post must be at least 3 characters long");
      return;
    }

    setError("");
    setSuccess("");
    try {
      await api.post("/forum", {
        content: newPostContent,
        anonymous: anonymous,
      });
      setSuccess("Post created successfully!");
      setNewPostContent("");
      setAnonymous(false);
      loadPosts();
    } catch (err) {
      console.error("Failed to create post:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to create post");
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setError("");
    try {
      await api.post(`/forum/${postId}/comments`, {
        content: newComment,
      });
      setNewComment("");
      loadComments(postId);
      setSuccess("Comment added successfully!");
    } catch (err) {
      console.error("Failed to add comment:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get unique birth clubs from posts
  const birthClubs = [...new Set(posts.map((p) => p.birthClub).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <BackButton to="/dashboard" />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Forum</h1>
          <p className="text-gray-600">
            Connect with other mothers and share your pregnancy journey
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Filter by Birth Club */}
        {birthClubs.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Due Date Month:
            </label>
            <select
              value={filterBirthClub}
              onChange={(e) => setFilterBirthClub(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Birth Clubs</option>
              {birthClubs.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Create New Post */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind? Share your pregnancy experience, ask questions, or offer support..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Post anonymously</span>
              </label>
              <button
                type="submit"
                className="ml-auto bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                Post
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500 text-lg">No posts yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">
                        {post.anonymous ? "Anonymous" : post.user?.name || "Unknown"}
                      </span>
                      {post.birthClub && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {post.birthClub}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Comments Section */}
                {selectedPost === post._id ? (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-3">Comments</h4>

                    {/* Comments List */}
                    {comments[post._id] && comments[post._id].length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {comments[post._id].map((comment) => (
                          <div
                            key={comment._id}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-800">
                                {comment.user?.name || "Unknown"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
                    )}

                    {/* Add Comment Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(post._id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        Comment
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPost(null);
                        setNewComment("");
                      }}
                      className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Hide Comments
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPost(post._id);
                      if (!comments[post._id]) {
                        loadComments(post._id);
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Comments ({comments[post._id]?.length || 0})
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;

