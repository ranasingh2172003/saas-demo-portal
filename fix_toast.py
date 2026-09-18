import re

# Add ToastProvider to RootLayout
file_path = "src/app/layout.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add import
if 'import { ToastProvider }' not in content:
    content = content.replace(
        'import { ThemeProvider } from "@/components/ThemeProvider";',
        'import { ThemeProvider } from "@/components/ThemeProvider";\nimport { ToastProvider } from "@/components/Toast";'
    )

# Wrap {children} with ToastProvider
content = content.replace(
    '<ThemeProvider attribute="class" defaultTheme="system" enableSystem>\n          {children}\n        </ThemeProvider>',
    '<ThemeProvider attribute="class" defaultTheme="system" enableSystem>\n          <ToastProvider>\n            {children}\n          </ToastProvider>\n        </ThemeProvider>'
)

with open(file_path, "w") as f:
    f.write(content)

# Remove ToastProvider from DashboardLayout to avoid double wrapping
dash_file = "src/components/DashboardLayout.tsx"
with open(dash_file, "r") as f:
    dash_content = f.read()

dash_content = dash_content.replace(
    '<ToastProvider>\n      <DashboardLayoutInner>{children}</DashboardLayoutInner>\n    </ToastProvider>',
    '<DashboardLayoutInner>{children}</DashboardLayoutInner>'
)
# Also handle if it's on one line
dash_content = dash_content.replace(
    '<ToastProvider><DashboardLayoutInner>{children}</DashboardLayoutInner></ToastProvider>',
    '<DashboardLayoutInner>{children}</DashboardLayoutInner>'
)

with open(dash_file, "w") as f:
    f.write(dash_content)

print("ToastProvider moved to RootLayout!")
