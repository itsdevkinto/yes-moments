# Yes Moments

Yes Moments is a web application that enables users to create personalized, interactive digital Valentine cards. The platform allows senders to craft a unique proposal experience featuring an animated envelope, custom themes, floating decorations, and a shareable link. Upon acceptance, the system records the event and triggers automated notifications.

## Live Demo

[https://itsdevkinto.github.io/yes-moments/](https://itsdevkinto.github.io/yes-moments/)

## Features

- Animated envelope opening sequence with custom CSS and Framer Motion
- Dynamic floating decorations supporting multiple types and custom image uploads
- Multiple configurable themes with real-time color application
- Custom question, begging messages, final message, and optional social links
- Acceptance tracking and screenshot capture
- Background music with user-initiated autoplay
- Fully responsive design

## Technical Architecture & Development Process

The project was developed entirely from scratch in a local IDE after reviewing an initial boilerplate concept. The frontend is built as a single-page React application, while the backend relies on Supabase for data persistence and real-time capabilities.

**Key implementation details:**

- **Frontend**: React with TypeScript, Vite as the build tool, Tailwind CSS for styling, and shadcn/ui for component primitives. Complex animations (envelope opening, floating elements) were implemented using a combination of CSS keyframes and Framer Motion.
- **State & Routing**: React Router for dynamic page handling based on unique shareable IDs.
- **Data Layer**: Supabase handles storage of Valentine pages, yes-event logging, and basic authentication flows.
- **Notifications**: When a recipient accepts, Supabase Edge Functions process the event and trigger emails via Resend.
- **Automation**: n8n workflows were integrated to orchestrate post-acceptance actions, including email delivery and logging.

A significant portion of development time was spent integrating the backend services. Because the application required reliable transactional emails and automated workflows on user acceptance, I had to learn and implement **Supabase Edge Functions**, **Resend** for email delivery, and **n8n** for workflow automation. These technologies were not part of my initial stack and required dedicated research and testing to ensure reliable triggering and delivery.

The entire application was coded, tested, and refined locally before deployment.

## Challenges

- Coordinating real-time acceptance detection with automated email delivery required careful design of Supabase Edge Functions and n8n workflows.
- Ensuring smooth animations (particularly the envelope and floating decorations) across different devices demanded extensive performance optimization.
- Implementing secure, shareable unique links while maintaining clean URL structures using React Router and Supabase.
- Balancing visual polish with performance, especially when rendering large numbers of animated floating elements.

## Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase (Database + Edge Functions)
- Resend (Transactional Email)
- n8n (Workflow Automation)

## Local Development

```bash
git clone https://github.com/itsdevkinto/yes-moments.git
cd yes-moments
npm install
npm run dev

Deployment
The application is deployed on GitHub Pages using GitHub Actions. For alternative hosting (Vercel or Netlify), the build output from npm run build can be used directly.
