import re

# Fix Developer IDE Mobile Layout
dev_file = "src/app/developer/page.tsx"
with open(dev_file, "r") as f:
    content = f.read()

# Fix the top bar to wrap on mobile
content = content.replace(
    '<div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-[#111118]">',
    '<div className="min-h-14 py-2 border-b border-gray-800 flex flex-wrap gap-2 items-center justify-between px-4 bg-[#111118]">'
)
content = content.replace(
    '<div className="font-medium text-sm bg-gray-800/50 px-3 py-1 rounded-md">My WhatsApp Bot</div>',
    '<div className="hidden sm:block font-medium text-sm bg-gray-800/50 px-3 py-1 rounded-md">My WhatsApp Bot</div>'
)

# Instead of making left panel take vertical space, let's just make sidebars hidden on mobile, or stacked but short.
# Since it's a React prototype, hiding the sidebars on very small screens (or making them collapsible) is best. Let's stack them but give them fixed heights on mobile.
content = content.replace(
    '<div className="w-full md:w-56 h-48 md:h-full shrink-0 bg-[#111118] border-b md:border-b-0 md:border-r border-gray-800 flex flex-col z-20">',
    '<div className="w-full md:w-56 h-48 md:h-full shrink-0 bg-[#111118] border-b md:border-b-0 md:border-r border-gray-800 flex flex-col z-20 overflow-y-auto hidden md:flex">'
)
content = content.replace(
    '<div className="w-full md:w-80 h-64 md:h-full shrink-0 bg-[#111118] border-t md:border-t-0 md:border-l border-gray-800 flex flex-col z-20">',
    '<div className="w-full md:w-80 h-64 md:h-full shrink-0 bg-[#111118] border-t md:border-t-0 md:border-l border-gray-800 flex flex-col z-20 hidden md:flex">'
)

# And add a banner on mobile saying "Use Desktop for full IDE"
content = content.replace(
    '<div className="flex-1 bg-[#0a0a0f] relative overflow-auto md:overflow-hidden">',
    '<div className="flex-1 bg-[#0a0a0f] relative overflow-auto md:overflow-hidden">\n          <div className="md:hidden absolute top-4 left-4 right-4 bg-purple-900/50 text-purple-200 p-3 rounded-lg border border-purple-500/30 text-sm z-50 text-center">📱 Please use a desktop browser for the full Drag & Drop IDE experience.</div>'
)

with open(dev_file, "w") as f:
    f.write(content)

# Fix SBO Dashboard Mobile Layout
sbo_file = "src/app/sbo/dashboard/page.tsx"
with open(sbo_file, "r") as f:
    content = f.read()

# Hide sidebar on mobile or make it horizontal
content = content.replace(
    '<div className="w-full md:w-56 md:h-full shrink-0 bg-[#111118] border-b md:border-b-0 md:border-r border-gray-800 flex flex-col">',
    '<div className="hidden md:flex w-full md:w-56 md:h-full shrink-0 bg-[#111118] border-b md:border-b-0 md:border-r border-gray-800 flex-col">'
)
# We need to make sure the main content is full height and scrolls
content = content.replace(
    '<div className="flex-1 flex flex-col overflow-hidden">',
    '<div className="flex-1 flex flex-col overflow-auto md:overflow-hidden">'
)

with open(sbo_file, "w") as f:
    f.write(content)

print("Refined Mobile patches applied!")
