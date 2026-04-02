@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set DATABASE_URL=file:./dev.db
set NEXTAUTH_SECRET=pilot-dev-secret
set NEXTAUTH_URL=http://localhost:3001
set ENCRYPTION_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
cd /d "C:\Users\J.Dercksen\OneDrive - PSV NV\Bureaublad\blauwdruk-pilot"
npx next dev --port 3001
