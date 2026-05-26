import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function TaskComments() {
  const { studioSlug, projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentEndRef = useRef(null);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      if (!studioSlug || studioSlug === 'undefined' || !projectId || projectId === 'undefined') {
        return;
      }
      try {
        const res = await api.get(`studios/${studioSlug}/projects/${projectId}/tasks/`);

        const taskList = Array.isArray(res.data) ? res.data : (res.data?.results || []);

        setTasks(taskList);

        if (taskList.length > 0) {
        setSelectedTaskId(taskList[0].id);
        }


      } catch (err) {
        console.error("Failed to load project tasks", err);
      }
    };

    fetchProjectTasks();
  }, [studioSlug, projectId]);


  useEffect(() => {
    const fetchComments = async () => {
      if (!studioSlug || !projectId || !selectedTaskId) return;

      try {
        const res = await api.get(
          `studios/${studioSlug}/projects/${projectId}/tasks/${selectedTaskId}/comments/`
        );
        const commentList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setComments(commentList);
      } catch (err) {
        console.error("Failed to load comments for selected task", err);
        setComments([]); 
      }
    };

    fetchComments();
  }, [studioSlug, projectId, selectedTaskId]);



  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!studioSlug || !projectId || !selectedTaskId) {
      alert("Cannot send comment: Task context parameters missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(
        `studios/${studioSlug}/projects/${projectId}/tasks/${selectedTaskId}/comments/`,
        { body: newComment.trim() }
      );
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to post comment", err.response?.data || err.message);
      alert("Failed to send comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email ? email.slice(0, 2).toUpperCase() : '??';
  };

  const activeTaskObj = tasks.find(t => t.id === selectedTaskId);

  return (
    <div style={{
      display: 'flex', width: '100%', height: 'calc(100vh - 64px)', 
      backgroundColor: '#1a202c', color: '#e2e8f0', fontFamily: 'sans-serif'
    }}>

      <div style={{
        width: '260px', borderRight: '1px solid #2d3748', 
        display: 'flex', flexDirection: 'column', backgroundColor: '#141a24'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #2d3748' }}>
          <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: '#718096', letterSpacing: '0.05em' }}>
            Project Tasks
          </h4>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {tasks.length === 0 ? (
            <p style={{ color: '#4a5568', fontSize: '13px', padding: '12px' }}>No tasks found.</p>
          ) : (
            tasks.map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                style={{
                  width: '100%', textLeft: 'left', textAlign: 'left', padding: '10px 12px',
                  borderRadius: '6px', border: 'none', marginBottom: '4px', cursor: 'pointer',
                  backgroundColor: selectedTaskId === task.id ? '#2b6cb0' : 'transparent',
                  color: selectedTaskId === task.id ? 'white' : '#cbd5e0',
                  fontSize: '13px', fontWeight: selectedTaskId === task.id ? '600' : 'normal',
                  transition: 'background-color 0.2s'
                }}
              >
                {task.title || 'Untitled Task'}
              </button>
            ))
          )}
        </div>
      </div>


      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1a202c' }}>
        

        <div style={{ padding: '16px', borderBottom: '1px solid #2d3748', backgroundColor: '#1e2430' }}>
          <span style={{ fontSize: '11px', color: '#3182ce', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Discussion 
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600', color: '#e2e8f0' }}>
           {activeTaskObj?.title || 'Loading workspace details...'}
          </h3>
        </div>


        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!selectedTaskId ? (
            <p style={{ color: '#718096', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
              Select a task to view comments.
            </p>
          ) : comments.length === 0 ? (
            <p style={{ color: '#718096', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
              No comments posted on this task yet.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                
                {/* User Avatar Badge */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', 
                  backgroundColor: '#4a5568', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#fff', flexShrink: 0
                }}>
                  {getInitials(comment.author_name, comment.author_email)}
                </div>

                {/* Message Bubble container */}
                <div style={{ backgroundColor: '#2d3748', padding: '12px', borderRadius: '8px', flex: 1, maxWidth: '85%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e0' }}>
                      {comment.author_name || comment.author_email}
                    </span>
                    <span style={{ fontSize: '11px', color: '#718096' }}>
                      {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                    {comment.body}
                  </p>
                </div>

              </div>
            ))
          )}
          <div ref={commentEndRef} />
        </div>

        <form onSubmit={handlePostComment} style={{ padding: '16px', borderTop: '1px solid #2d3748', backgroundColor: '#1a202c' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
            
             placeholder={selectedTaskId ? `Type a message for ${activeTaskObj?.title || 'task'}...` : "Select a task..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting || !selectedTaskId}
              style={{
                flex: 1, backgroundColor: '#2d3748', border: '1px solid #4a5568',
                borderRadius: '6px', padding: '12px', color: 'white', fontSize: '13px', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim() || !selectedTaskId}
              style={{
                backgroundColor: '#3182ce', color: 'white', border: 'none',
                borderRadius: '6px', padding: '0 20px', fontSize: '13px', fontWeight: 'bold',
                cursor: isSubmitting || !newComment.trim() || !selectedTaskId ? 'not-allowed' : 'pointer', 
                opacity: !newComment.trim() || !selectedTaskId ? 0.6 : 1
              }}
            >
              {isSubmitting ? '...' : 'Post'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}