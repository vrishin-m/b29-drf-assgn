import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Projects() {
  const { studioSlug } = useParams();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
 
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const userResponse = await api.get('auth/me/'); 
        setCurrentUserId(userResponse.data.id); 

        const projectResponse = await api.get(`studios/${studioSlug}/projects/`);
        
        let extractedProjects = [];
        if (Array.isArray(projectResponse.data)) {
          extractedProjects = projectResponse.data;
        } else if (projectResponse.data && Array.isArray(projectResponse.data.results)) {
          extractedProjects = projectResponse.data.results;
        }

        setProjects(extractedProjects);
      } catch (err) {
        const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        setMessage(`Initialization Error: ${errorDetail}`);
      } finally {
        setLoading(false);
      }
    };

    if (studioSlug) {
      initializePage();
    } else {
      setMessage(" missing :studioSlug ");
      setLoading(false);
    }
  }, [studioSlug]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    if (!currentUserId) {
      setMessage("Cannot create project: Your user profile session was not resolved.");
      return;
    }

    setIsCreating(true);
    setMessage('');

    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);

    const payload = {
      title: newProjectName,
      description: newProjectDesc,
      deadline: defaultDeadline.toISOString(),
      lead: currentUserId,       
      created_by: currentUserId, 
    };

    try {
      const response = await api.post(`studios/${studioSlug}/projects/`, payload);
      setProjects([response.data, ...projects]);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      console.error(err);
      setMessage(`Failed to create project: ${JSON.stringify(err.response?.data || 'Server error')}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = (projectId) => {
    localStorage.setItem('current_project_id', projectId);
    navigate(`/studios/${studioSlug}/projects/${projectId}/organize`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a202c', color: '#cbd5e0', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px' }}>Syncing Projects & User Profiles...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', backgroundColor: '#1a202c', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <Link to="/studios" style={{ color: '#63b3ed', textDecoration: 'none', fontSize: '14px' }}>← Back to Studios</Link>
          <h1 style={{ fontSize: '32px', marginTop: '10px', fontWeight: '700' }}>
            Workspace: <span style={{ color: '#63b3ed' }}>{studioSlug}</span>
          </h1>
        </div>

        {message && (
          <div style={{ backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '12px 16px', borderRadius: '6px', marginBottom: '25px', fontSize: '14px', border: '1px solid #feb2b2' }}>
            {message}
          </div>
        )}


        <form onSubmit={handleCreateProject} style={{ backgroundColor: '#2d3748', padding: '24px', borderRadius: '8px', marginBottom: '40px', border: '1px solid #4a5568' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>Initialize New Project </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Project Title (Required)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#1a202c', color: 'white', fontSize: '14px' }}
              required
            />
            <input
              type="text"
              placeholder="Scope Summary (Optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#1a202c', color: 'white', fontSize: '14px' }}
            />
            <button 
              type="submit" 
              disabled={isCreating}
              style={{ padding: '12px', backgroundColor: isCreating ? '#4a5568' : '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '5px' }}
            >
              {isCreating ? 'Loading...' : 'Deploy Project'}
            </button>
          </div>
        </form>

        {/* Existing Layout Output Grid */}
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Active projects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {projects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#2d3748', borderRadius: '8px', border: '1px dashed #4a5568' }}>
              <p style={{ color: '#a0aec0', margin: 0 }}>No active projects.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => handleOpenProject(project.id)}
                style={{ backgroundColor: '#2d3748', padding: '20px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #4a5568', transition: 'all 0.2s ease' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#63b3ed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#4a5568'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: 'white' }}>{project.title}</h3>
                <p style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 20px 0', minHeight: '40px' }}>
                  {project.description || 'No description available.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#718096', borderTop: '1px solid #4a5568', paddingTop: '12px' }}>
                  <span>REF: {project.id ? project.id.split('-')[0] : 'N/A'}</span>
                  <span style={{ color: '#63b3ed', fontWeight: '600' }}>Access Deck →</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}