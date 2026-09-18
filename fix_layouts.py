import os
import shutil

# 1. Fix src/app/layout.tsx to ONLY have RootLayout without DashboardLayout
root_layout_path = "src/app/layout.tsx"
with open(root_layout_path, "r") as f:
    content = f.read()

# Remove DashboardLayout import
content = content.replace('import DashboardLayout from "@/components/DashboardLayout";\n', '')
# Replace <DashboardLayout>{children}</DashboardLayout> with just {children}
content = content.replace('<DashboardLayout>{children}</DashboardLayout>', '{children}')

with open(root_layout_path, "w") as f:
    f.write(content)

# 2. Create Route Groups
# Wait, if we use a Route Group (dashboard), we have to move the pages into it.
# The pages that need the dashboard are:
# - /sbo/dashboard
# - /developer/agents
# - /settings (if it exists)
# But wait, moving them to (dashboard) changes their path?
# No, (dashboard) is a route group, so src/app/(dashboard)/sbo/dashboard/page.tsx maps to /sbo/dashboard.
# But it's easier to just wrap the individual pages with <DashboardLayout> instead of restructuring the folders!
