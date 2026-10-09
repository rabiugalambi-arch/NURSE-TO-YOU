const fs = require('fs');
let adminContent = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

adminContent = adminContent.replace(
  /import \{ \$\{existingIcons.join\(\', \'\)\} \} from 'lucide-react'/g,
  `import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Search, Activity, UserCircle, Store, Stethoscope, Phone, Mail, ShieldAlert, ShieldCheck, Clock, LayoutDashboard, MapPin, X, Menu, Settings, LogOut } from 'lucide-react';`
);

fs.writeFileSync('src/components/AdminApp.tsx', adminContent);
console.log("Fixed icon import syntax error");
