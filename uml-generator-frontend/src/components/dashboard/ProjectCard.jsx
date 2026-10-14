'use client'

import Link from 'next/link'

export default function ProjectCard({ project }) {

  return (
    <div className="project-card glass-card">

      <div className="project-card-preview">
        <div className="project-card-gradient" />
        <div className="project-card-code" style={{ color: project.codeColor }}>
          <div>{project.preview}</div>
        </div>
      </div>

      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-date">{project.date}</p>

        <div className="project-card-footer">

          <Link href={`/editor/${project.id}`} className="project-card-open">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              open_in_new
            </span>
            Open
          </Link>

        </div>
      </div>

    </div>
  )
}
