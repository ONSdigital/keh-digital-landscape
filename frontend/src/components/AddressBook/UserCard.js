import React from 'react';
import '../../styles/components/UserCard.css';

const UserCard = ({ username, email, githubUrl, fullName, avatarUrl }) => {
  const displayName = fullName || username || '';
  const initials = (displayName || '')
    .split(' ')
    .map(p => p && p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="user-card" aria-label={`User card for ${displayName}`}>
      <div className="user-card-avatar">
        {avatarUrl ? (
          <img
            className="user-card-avatar-img"
            src={avatarUrl}
            alt=""
            decoding="async"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="user-card-body">
        <div className="user-card-header">
          <h3 className="user-card-name">{displayName}</h3>
          {username && displayName && username !== displayName && (
            <span className="user-card-username">@{username}</span>
          )}
        </div>
        <ul className="user-card-meta">
          {email && (
            <li>
              <a
                className="user-card-link"
                href={`mailto:${email}`}
                title={`Email ${displayName}`}
              >
                {email}
              </a>
            </li>
          )}
          {githubUrl && (
            <li>
              <a
                className="user-card-link"
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${displayName}'s GitHub`}
              >
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </article>
  );
};

export default UserCard;
