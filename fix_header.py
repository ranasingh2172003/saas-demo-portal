import re

file_path = "src/components/DashboardLayout.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Hide "Apex Cooling" text on mobile in the breadcrumb
content = content.replace(
    '<span className="font-semibold">Apex Cooling</span>',
    '<span className="hidden sm:inline font-semibold">Apex Cooling</span>'
)
# Hide the chevron on mobile
content = content.replace(
    '<ChevronRight className="w-4 h-4 mx-1.5 text-slate-400" />',
    '<ChevronRight className="hidden sm:block w-4 h-4 mx-1.5 text-slate-400" />'
)

# 2. Make the search button smaller on mobile
# Currently: <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 ...>
# <span className="md:hidden font-medium">Search</span>
content = content.replace(
    '<span className="md:hidden font-medium">Search</span>',
    '<!-- hidden -->'
)

# Make sure the header handles flex-wrap or shrinking if needed
content = content.replace(
    'truncate max-w-[140px] sm:max-w-none',
    'truncate max-w-[100px] sm:max-w-none'
)

# Fix the padding of search button on mobile
content = content.replace(
    'px-3 py-1.5 text-xs',
    'p-1.5 sm:px-3 sm:py-1.5 text-xs'
)

with open(file_path, "w") as f:
    f.write(content)

print("Dashboard header mobile patched!")
