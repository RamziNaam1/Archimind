'use client'

import { useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = 5

export default function UsersTable({
  users,
  onDeleteUser,
  onToggleStatus,
  onEditUser,
  onResetPassword,
  totalCount,
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [users])

  const visibleUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return users.slice(start, start + PAGE_SIZE)
  }, [users, currentPage])

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  return (
    <div className="admin-users-table glass-panel">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Date Joined</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {visibleUsers.map((user) => (
            <tr key={user.id} className="admin-table-row">

              {/* NAME */}
              <td>
                <div className="admin-user-cell">
                  <div className="admin-user-avatar-small">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </div>
              </td>

              {/* EMAIL */}
              <td>
                <span className="admin-email">{user.email}</span>
              </td>

              {/* ROLE */}
              <td>
                <span className={`admin-role-badge role-${user.role.toLowerCase().replace(' ', '-')}`}>
                  {user.role}
                </span>
              </td>

              {/* STATUS (FIXED lowercase logic) */}
              <td>
                <div className={`admin-status ${user.status}`}>
                  <span className="admin-status-dot"></span>
                  <span className="admin-status-text">
                    {user.status}
                  </span>
                </div>
              </td>

              {/* DATE */}
              <td>
                <span className="admin-date">{user.dateJoined}</span>
              </td>

              {/* ACTIONS (FIXED) */}
              <td>
                <div className="admin-actions">

                  {/* Edit */}
                  <button
                    className="admin-action-btn"
                    title="Edit"
                    type="button"
                    onClick={() => onEditUser(user)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>

                  {/* Reset */}
                  <button
                    className="admin-action-btn"
                    title="Reset Password"
                    type="button"
                    onClick={() => onResetPassword(user.id)}
                  >
                    <span className="material-symbols-outlined">lock_reset</span>
                  </button>

                  {/* TOGGLE STATUS (FIXED) */}
                  <button
                    className="admin-action-btn danger"
                    title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                    type="button"
                    onClick={() => onToggleStatus(user.id)}
                  >
                    <span className="material-symbols-outlined">
                      {user.status === 'active' ? 'person_off' : 'person_check'}
                    </span>
                  </button>

                  {/* DELETE */}
                  <button
                    className="admin-action-btn danger"
                    title="Delete"
                    type="button"
                    onClick={() => onDeleteUser(user.id)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer (optional cleanup later) */}
      <div className="admin-table-footer">
        <p className="admin-table-info">
          Showing <span className="admin-count">{visibleUsers.length}</span> of{' '}
          <span className="admin-count">{users.length}</span> results
        </p>

        <div className="admin-pagination">
          <button
            className="admin-pagination-btn"
            type="button"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            title="Previous page"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="admin-pagination-numbers">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                className={`admin-page-btn ${currentPage === page ? 'active' : ''}`}
                type="button"
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="admin-pagination-btn"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            title="Next page"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
