import React from 'react';
import Clients from './Clients';
import { getPublicTeam, getImageUrl } from '../api/client';

const TeamMember = ({ name, role, bio, image }) => (
  <div className="team-card glass-card">
    <div className="member-image-placeholder" style={image ? { background: `url('${getImageUrl(image)}') center/cover no-repeat` } : {}}>
      <div className="hexagon-mask"></div>
    </div>
    <div className="member-info">
      <h3>{name}</h3>
      <p className="member-role">{role}</p>
      <p className="member-bio">{bio}</p>
    </div>
  </div>
);

const Team = () => {
  const [members, setMembers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getPublicTeam()
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
    <div className="team-page">
      <div className="container">
        <header className="page-header center" style={{ paddingTop: '0rem' }}>
          <h1 className="section-title">Our Teams</h1>
          <p className="subtitle">Driven by innovation, backed by expertise.</p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading team...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No team members to display.</div>
        ) : (
          <div className="team-grid">
            {members.map((member, i) => (
              <TeamMember key={member.id || i} {...member} />
            ))}
          </div>
        )}
      </div>
    </div>
    <Clients />
    </>
  );
};

export default Team;
