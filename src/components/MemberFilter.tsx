import { useAppStore } from '../store';

export function MemberFilter() {
  const { members, selectedMemberIds, toggleMember, selectAllMembers } = useAppStore();
  const allSelected = selectedMemberIds.length === members.length;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
      <button
        onClick={selectAllMembers}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          allSelected
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        👨‍👩‍👧‍👦 כולם
      </button>
      {members.map((m) => {
        const selected = selectedMemberIds.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => toggleMember(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              selected ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={selected ? { backgroundColor: m.color } : {}}
            title={m.name}
          >
            <span>{m.avatar}</span>
            <span>{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}
