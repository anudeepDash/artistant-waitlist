'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link as LinkIcon, QrCode, Plus, Trash2, Edit3, Eye, MoveUp, MoveDown, 
  ExternalLink, Sparkles, Check, Download, Briefcase, User, ShieldCheck, 
  Share2, Save, Globe, Mail, PhoneCall, RefreshCw, Layers
} from 'lucide-react';
import { getLinktreeItems, saveLinktreeItems, type LinktreeItem } from '@/lib/linktree-data';
import { getAllTeamMembersMap, saveTeamMembersMap, type TeamMember, downloadVCard } from '@/lib/team-data';
import BusinessCardPreview from '@/components/BusinessCardPreview';
import LinktreeQRModal from '@/components/LinktreeQRModal';

interface LinksAndCardsTabProps {
  onSuccessToast?: (msg: string) => void;
}

export default function LinksAndCardsTab({ onSuccessToast }: LinksAndCardsTabProps) {
  const [subTab, setSubTab] = useState<'links' | 'cards'>('links');
  
  // Linktree state
  const [links, setLinks] = useState<LinktreeItem[]>([]);
  const [editingLink, setEditingLink] = useState<LinktreeItem | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Team Cards state
  const [teamMap, setTeamMap] = useState<Record<string, TeamMember>>({});
  const [selectedFounderKey, setSelectedFounderKey] = useState<string>('anudeep');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showFounderModal, setShowFounderModal] = useState(false);

  // QR Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState('https://artistant.in/links');

  // Load initial data
  useEffect(() => {
    setLinks(getLinktreeItems());
    setTeamMap(getAllTeamMembersMap());
  }, []);

  // Save links changes
  const handleSaveLinks = (updated: LinktreeItem[]) => {
    setLinks(updated);
    saveLinktreeItems(updated);
    if (onSuccessToast) onSuccessToast('Linktree items updated successfully!');
  };

  // Add or Update Link
  const handleSaveSingleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    let updated: LinktreeItem[];
    const exists = links.some(l => l.id === editingLink.id);

    if (exists) {
      updated = links.map(l => l.id === editingLink.id ? editingLink : l);
    } else {
      updated = [editingLink, ...links];
    }

    handleSaveLinks(updated);
    setShowLinkModal(false);
    setEditingLink(null);
  };

  // Delete Link
  const handleDeleteLink = (id: string) => {
    if (!confirm('Are you sure you want to remove this link?')) return;
    const updated = links.filter(l => l.id !== id);
    handleSaveLinks(updated);
  };

  // Reorder Link
  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;
    const copy = [...links];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    handleSaveLinks(copy);
  };

  // Save Team changes
  const handleSaveTeamMap = (updatedMap: Record<string, TeamMember>) => {
    setTeamMap(updatedMap);
    saveTeamMembersMap(updatedMap);
    if (onSuccessToast) onSuccessToast('Founder & Team Business Cards updated!');
  };

  // Save single founder card
  const handleSaveFounder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const username = editingMember.username.toLowerCase().trim();
    const updatedMap = {
      ...teamMap,
      [username]: { ...editingMember, username }
    };

    handleSaveTeamMap(updatedMap);
    setSelectedFounderKey(username);
    setShowFounderModal(false);
    setEditingMember(null);
  };

  // Delete Founder Card
  const handleDeleteFounder = (username: string) => {
    if (!confirm(`Are you sure you want to delete @${username}'s card?`)) return;
    const copy = { ...teamMap };
    delete copy[username];
    handleSaveTeamMap(copy);
    const keys = Object.keys(copy);
    if (keys.length > 0) setSelectedFounderKey(keys[0]);
  };

  const selectedMember = teamMap[selectedFounderKey] || Object.values(teamMap)[0];

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F25A2B]/10 border border-[#F25A2B]/20 text-[#F25A2B] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXECUTIVE STUDIO</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink">
            Links & Founder Cards Studio
          </h2>
          <p className="text-xs md:text-sm text-ink-2 mt-1 max-w-xl leading-relaxed">
            Manage official Linktree links for <strong className="text-ink">artistant.in/links</strong> and edit digital business cards & printable QR codes for founders at <strong className="text-ink">artistant.in/card</strong>.
          </p>
        </div>

        {/* Sub-Tab Navigation Toggle */}
        <div className="flex items-center p-1.5 rounded-2xl bg-bg-soft border border-line-soft gap-1 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('links')}
            className={`
              flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer
              ${subTab === 'links' 
                ? 'bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md' 
                : 'text-ink-3 hover:text-ink'}
            `}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Linktree Hub</span>
          </button>

          <button
            onClick={() => setSubTab('cards')}
            className={`
              flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer
              ${subTab === 'cards' 
                ? 'bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md' 
                : 'text-ink-3 hover:text-ink'}
            `}
          >
            <Briefcase className="w-4 h-4" />
            <span>Founder Cards</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LINKTREE MANAGER */}
      {subTab === 'links' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-line-soft">
            <div className="flex items-center gap-3 text-xs font-mono text-ink-2">
              <span className="font-bold text-ink">{links.length} Active Links</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">artistant.in/links</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="/links"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-bg-soft border border-line-soft hover:bg-bg-soft-hover text-ink text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all"
              >
                <Eye className="w-4 h-4 text-brand" />
                <span>Live View</span>
              </a>

              <button
                onClick={() => {
                  setQrModalUrl('https://artistant.in/links');
                  setIsQRModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-bg-soft border border-line-soft hover:bg-bg-soft-hover text-ink text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#7C5CFF]" />
                <span>QR Studio</span>
              </button>

              <button
                onClick={() => {
                  setEditingLink({
                    id: `link-${Date.now()}`,
                    title: '',
                    description: '',
                    url: '',
                    category: 'ecosystem',
                    iconName: 'Sparkles',
                    badge: '',
                    badgeColor: 'from-[#F25A2B] to-[#7C5CFF]',
                    featured: false,
                    isExternal: false,
                    clicksCount: 0
                  });
                  setShowLinkModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#F25A2B] hover:bg-[#F25A2B]/90 text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Link</span>
              </button>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-3">
            {links.map((item, idx) => (
              <div
                key={item.id}
                className="
                  p-5 rounded-2xl bg-bg-card border border-line-soft hover:border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all
                "
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-bg-soft border border-line-soft flex items-center justify-center font-mono font-bold text-xs text-ink-2 shrink-0">
                    #{idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-bold text-base text-ink truncate">{item.title}</h4>
                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-brand-1/15 text-brand-1 border border-brand-1/30">
                          {item.badge}
                        </span>
                      )}
                      {item.featured && (
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-2 truncate mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-ink-3 mt-1">
                      <span className="text-brand truncate">{item.url}</span>
                      <span>•</span>
                      <span className="uppercase">{item.category}</span>
                      {item.clicksCount !== undefined && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{item.clicksCount} Clicks</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleMoveLink(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-lg bg-bg-soft hover:bg-bg-soft-hover text-ink-2 hover:text-ink disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveLink(idx, 'down')}
                    disabled={idx === links.length - 1}
                    className="p-2 rounded-lg bg-bg-soft hover:bg-bg-soft-hover text-ink-2 hover:text-ink disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingLink(item);
                      setShowLinkModal(true);
                    }}
                    className="p-2 rounded-lg bg-bg-soft hover:bg-bg-soft-hover text-brand cursor-pointer"
                    title="Edit Link"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteLink(item.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                    title="Delete Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FOUNDER CARDS MANAGER */}
      {subTab === 'cards' && (
        <div className="space-y-8">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-line-soft">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {Object.values(teamMap).map((m) => (
                <button
                  key={m.username}
                  onClick={() => setSelectedFounderKey(m.username)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-2
                    ${selectedFounderKey === m.username
                      ? 'bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md'
                      : 'bg-bg-soft text-ink-2 hover:text-ink border border-line-soft'}
                  `}
                >
                  <span>{m.name}</span>
                  <span className="text-[9px] opacity-60">({m.badge})</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setEditingMember({
                  username: `founder-${Date.now().toString().slice(-4)}`,
                  name: '',
                  role: 'Executive Member',
                  tagline: 'Building the infrastructure for live entertainment.',
                  bio: 'Core executive team member at Artistant.',
                  email: 'team@artistant.in',
                  phone: '+91 98765 43210',
                  location: 'Bengaluru, India',
                  avatarUrl: '/logo_a_highres.png',
                  badge: 'FOUNDER',
                  department: 'Executive Office',
                  company: 'Artistant',
                  website: 'https://artistant.in',
                  socials: {
                    linkedin: 'https://www.linkedin.com/company/artistantco/',
                    twitter: 'https://x.com/artistant_in',
                    instagram: 'https://instagram.com/artistant.in'
                  },
                  highlights: ['Verified Executive Member']
                });
                setShowFounderModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#F25A2B] hover:bg-[#F25A2B]/90 text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Founder Card</span>
            </button>
          </div>

          {/* Active Selected Founder Card Preview Studio */}
          {selectedMember && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: 3D Interactive Card Preview */}
              <div className="p-6 rounded-3xl bg-bg-card border border-line-soft flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between pb-4 border-b border-line-soft mb-6">
                  <div>
                    <h3 className="font-display font-bold text-xl text-ink">{selectedMember.name}</h3>
                    <p className="text-xs text-brand font-mono">{selectedMember.role}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 font-bold">
                    {selectedMember.badge}
                  </span>
                </div>

                <BusinessCardPreview
                  member={selectedMember}
                  onDownloadVCard={() => downloadVCard(selectedMember)}
                  onBookCall={() => alert(`Calendar booking flow active for ${selectedMember.name}`)}
                />

                <div className="w-full pt-6 border-t border-line-soft mt-6 flex items-center justify-between text-xs font-mono text-ink-3">
                  <span>artistant.in/card/{selectedMember.username}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setQrModalUrl(`https://artistant.in/card/${selectedMember.username}`);
                        setIsQRModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-bg-soft hover:bg-bg-soft-hover text-ink flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#7C5CFF]" />
                      <span>Print QR</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Card Details & Edit Trigger */}
              <div className="p-6 rounded-3xl bg-bg-card border border-line-soft space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-line-soft">
                    <span className="text-xs font-mono uppercase font-bold text-brand">Profile Details</span>
                    <button
                      onClick={() => {
                        setEditingMember(selectedMember);
                        setShowFounderModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Founder Card</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div><strong className="text-ink font-mono uppercase text-[10px] block text-ink-3">Tagline:</strong> <span className="text-ink">{selectedMember.tagline}</span></div>
                    <div><strong className="text-ink font-mono uppercase text-[10px] block text-ink-3">Bio:</strong> <span className="text-ink-2 leading-relaxed">{selectedMember.bio}</span></div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div><strong className="text-ink font-mono uppercase text-[10px] block text-ink-3">Email:</strong> <span className="text-ink font-mono">{selectedMember.email}</span></div>
                      <div><strong className="text-ink font-mono uppercase text-[10px] block text-ink-3">Phone:</strong> <span className="text-ink font-mono">{selectedMember.phone}</span></div>
                      <div><strong className="text-ink font-mono uppercase text-[10px] block text-ink-3">Location:</strong> <span className="text-ink font-mono">{selectedMember.location}</span></div>
                      <div><strong className="text-ink font-mono uppercase text-[10px] block text-ink-3">Department:</strong> <span className="text-ink font-mono">{selectedMember.department}</span></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <strong className="text-ink font-mono uppercase text-[10px] block text-ink-3 mb-2">Key Highlights:</strong>
                    <div className="space-y-1.5">
                      {selectedMember.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-ink-2 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-line-soft flex items-center justify-between">
                  <a
                    href={`/card/${selectedMember.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-brand hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>View Public Card Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {Object.keys(teamMap).length > 1 && (
                    <button
                      onClick={() => handleDeleteFounder(selectedMember.username)}
                      className="text-xs font-mono text-red-500 hover:underline cursor-pointer"
                    >
                      Delete Card
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT/ADD LINK MODAL */}
      <AnimatePresence>
        {showLinkModal && editingLink && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#121422] text-white rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-display font-bold text-xl mb-4">
                {links.some(l => l.id === editingLink.id) ? 'Edit Linktree Link' : 'Add New Linktree Link'}
              </h3>

              <form onSubmit={handleSaveSingleLink} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingLink.title}
                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#F25A2B]"
                    placeholder="e.g. Artist Handle Reservation"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Description</label>
                  <input
                    type="text"
                    value={editingLink.description}
                    onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#F25A2B]"
                    placeholder="e.g. Reserve @username for instant escrow payouts"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Target URL *</label>
                  <input
                    type="text"
                    required
                    value={editingLink.url}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#F25A2B]"
                    placeholder="e.g. /claim or https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Category</label>
                    <select
                      value={editingLink.category}
                      onChange={(e) => setEditingLink({ ...editingLink, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1C2A] border border-white/15 text-white text-xs font-mono focus:outline-none"
                    >
                      <option value="ecosystem">Ecosystem</option>
                      <option value="artists">Artists & Gigs</option>
                      <option value="venues">Venues & Events</option>
                      <option value="community">Community & Socials</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={editingLink.badge || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono uppercase focus:outline-none"
                      placeholder="e.g. POPULAR, NEW, LIVE"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLink.featured || false}
                      onChange={(e) => setEditingLink({ ...editingLink, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#F25A2B]"
                    />
                    <span>Highlight as Featured Link</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLink.isExternal || false}
                      onChange={(e) => setEditingLink({ ...editingLink, isExternal: e.target.checked })}
                      className="w-4 h-4 rounded text-[#F25A2B]"
                    />
                    <span>Opens in New Tab</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    Save Link Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT/ADD FOUNDER MODAL */}
      <AnimatePresence>
        {showFounderModal && editingMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFounderModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#121422] text-white rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-display font-bold text-xl mb-4">Edit Founder Business Card Profile</h3>

              <form onSubmit={handleSaveFounder} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Handle / Username *</label>
                    <input
                      type="text"
                      required
                      value={editingMember.username}
                      onChange={(e) => setEditingMember({ ...editingMember, username: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Role Title *</label>
                    <input
                      type="text"
                      required
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={editingMember.badge}
                      onChange={(e) => setEditingMember({ ...editingMember, badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono uppercase focus:outline-none"
                      placeholder="e.g. FOUNDER, CTO, EXECUTIVE"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingMember.tagline}
                    onChange={(e) => setEditingMember({ ...editingMember, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Biography</label>
                  <textarea
                    rows={3}
                    value={editingMember.bio}
                    onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Email</label>
                    <input
                      type="email"
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingMember.phone}
                      onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Location</label>
                    <input
                      type="text"
                      value={editingMember.location}
                      onChange={(e) => setEditingMember({ ...editingMember, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">Department</label>
                    <input
                      type="text"
                      value={editingMember.department}
                      onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    Save Founder Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFounderModal(false)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR MODAL */}
      <LinktreeQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        targetUrl={qrModalUrl}
        title="Artistant Executive QR Studio"
        subtitle="Printable vector QR code for business cards"
      />
    </div>
  );
}
