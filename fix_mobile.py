import re

# Fix Developer IDE Mobile Layout
dev_file = "src/app/developer/page.tsx"
with open(dev_file, "r") as f:
    content = f.read()

content = content.replace(
    '<div className="flex-1 flex overflow-hidden">', 
    '<div className="flex-1 flex flex-col md:flex-row overflow-hidden">'
)
content = content.replace(
    '<div className="w-56 bg-[#111118] border-r border-gray-800 flex flex-col">',
    '<div className="w-full md:w-56 h-48 md:h-full shrink-0 bg-[#111118] border-b md:border-b-0 md:border-r border-gray-800 flex flex-col z-20">'
)
content = content.replace(
    '<div className="w-80 bg-[#111118] border-l border-gray-800 flex flex-col">',
    '<div className="w-full md:w-80 h-64 md:h-full shrink-0 bg-[#111118] border-t md:border-t-0 md:border-l border-gray-800 flex flex-col z-20">'
)
# Make the canvas relatively positioned and handle mobile scaling better
content = content.replace(
    '<div className="flex-1 bg-[#0a0a0f] relative overflow-hidden"',
    '<div className="flex-1 bg-[#0a0a0f] relative overflow-auto md:overflow-hidden"'
)

with open(dev_file, "w") as f:
    f.write(content)

# Fix SBO Dashboard Mobile Layout
sbo_file = "src/app/sbo/dashboard/page.tsx"
with open(sbo_file, "r") as f:
    content = f.read()

content = content.replace(
    '<div className="h-screen flex bg-[#0d0d14] text-white">',
    '<div className="h-screen flex flex-col md:flex-row bg-[#0d0d14] text-white overflow-y-auto md:overflow-hidden">'
)
content = content.replace(
    '<div className="w-56 bg-[#111118] border-r border-gray-800 flex flex-col">',
    '<div className="w-full md:w-56 md:h-full shrink-0 bg-[#111118] border-b md:border-b-0 md:border-r border-gray-800 flex flex-col">'
)
# Fix grid cols on mobile for KPI cards
content = content.replace(
    '<div className="grid grid-cols-4 gap-6 mb-8">',
    '<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">'
)

with open(sbo_file, "w") as f:
    f.write(content)

print("Mobile responsive patches applied!")
