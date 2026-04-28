# Project Structure

This document captures the current folder-first scaffold for `frontend1`.

```text
frontend1/
├── public/
└── src/
    ├── app/
    │   ├── auth/
    │   ├── classes/
    │   │   └── [id]/
    │   ├── dashboard/
    │   │   ├── admin/
    │   │   │   ├── manage-users/
    │   │   │   └── report/
    │   │   ├── student/
    │   │   │   └── my-classes/
    │   │   └── tutor/
    │   │       ├── classes/
    │   │       ├── contact/
    │   │       ├── Home/
    │   │       ├── post-ad/
    │   │       └── profile/
    │   │           └── edit/
    │   ├── messaging/
    │   └── tutors/
    ├── components/
    │   ├── cards/
    │   └── navbar/
    ├── context/
    ├── data/
    ├── hooks/
    ├── lib/
    ├── middleware/
    ├── services/
    ├── styles/
    └── utils/
```

Notes:
- Empty folders are preserved in Git using `.gitkeep` files.
- Feature files can be added incrementally as implementation starts.
