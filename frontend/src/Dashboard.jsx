export default function Dashboard({ user, onLogout }) {
  return (
    <div className="card">
      <img className="avatar" src={user.avatar} alt={user.username} />
      <h2>{user.fullName}</h2>
      <p>@{user.username}</p>
      <p>{user.email}</p>
      <button onClick={onLogout}>Log out</button>
    </div>
  );
}
