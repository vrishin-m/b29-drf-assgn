import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function StudioMembers() {
  const { studioSlug } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  

  const [usernameToInvite, setUsernameToInvite] = useState('');
  const [selectedRole, setSelectedRole] = useState('designer'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get(`studios/${studioSlug}/members/`);
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setMembers(data);
      } catch (err) {
        console.error(err);
        setMessage("Could not load the member list.");
      } finally {
        setLoading(false);
      }
    };
    if (studioSlug) fetchMembers();
  }, [studioSlug]);


const [emailToInvite, setEmailToInvite] = useState('');

const handleAddMember = async (e) => {
  e.preventDefault();
  if (!emailToInvite.trim()) return;

  setIsSubmitting(true);
  setMessage('');
  setSuccess('');

  const payload = {
    invite_email: emailToInvite.trim(), 
    role: selectedRole
  };

  try {
    const response = await api.post(`studios/${studioSlug}/add_member/`, payload);
    setMembers([...members, response.data]);
    setSuccess(`Successfully added ${emailToInvite} to the studio!`);
    setEmailToInvite(''); 
  } catch (err) {
    const serverErr = err.response?.data ? JSON.stringify(err.response.data) : "Submission error";
    setMessage(`Failed to add user: ${serverErr}`);
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) return <div style={{ padding: '40px', color: '#cbd5e0', backgroundColor: '#1a202c', minHeight: '100vh' }}>Loading members...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', backgroundColor: '#1a202c', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <Link to={`/studios/${studioSlug}/projects`} style={{ color: '#63b3ed', textDecoration: 'none', fontSize: '14px' }}> Back to Projects Hub</Link>
          <h1 style={{ fontSize: '28px', marginTop: '10px', fontWeight: '700' }}>
            Personnel Directory: <span style={{ color: '#63b3ed' }}>{studioSlug}</span>
          </h1>
        </div>

  
        {message && <div style={{ backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{message}</div>}
        {success && <div style={{ backgroundColor: '#c6f6d5', color: '#22543d', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}

        <form onSubmit={handleAddMember} style={{ backgroundColor: '#2d3748', padding: '20px', borderRadius: '8px', marginBottom: '35px', border: '1px solid #4a5568', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#a0aec0', fontWeight: 'bold', textTransform: 'uppercase' }}>Email</label>
            <input
              type="email"
              placeholder="e.g., nova@mdg.com"
              value={emailToInvite}
              onChange={(e) => setEmailToInvite(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '11px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#1a202c', color: 'white', fontSize: '14px' }}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#a0aec0', fontWeight: 'bold', textTransform: 'uppercase' }}>Workspace Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#1a202c', color: 'white', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="studio_admin">Studio Admin</option>
              <option value="project_lead">Project Lead</option>
              <option value="designer">Designer</option>
              <option value="writer">Writer</option>
              <option value="reviewer">Reviewer</option>
              <option value="client_viewer">Client Viewer</option>

             
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ padding: '12px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            {isSubmitting ? 'Onboarding...' : 'Add Member'}
          </button>
        </form>

  
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>Studio Members</h2>
        <div style={{ backgroundColor: '#2d3748', borderRadius: '8px', border: '1px solid #4a5568', overflow: 'hidden' }}>
          {members.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>No membership attachments detected inside this studio.</div>
          ) : (
            members.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #4a5568' }}>
                <div>
                  <strong style={{ color: 'white', fontSize: '15px', display: 'block' }}>@{m.username}</strong>
                  <span style={{ fontSize: '13px', color: '#a0aec0' }}>{m.email || 'No email attached'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#63b3ed', backgroundColor: '#1a202c', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {m.role}
                  </span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#718096', marginTop: '6px' }}>
                    Joined: {new Date(m.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}