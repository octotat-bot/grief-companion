import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useHistory } from '../hooks/useHistory';

export default function Profile({ onBack }) {
  const { user } = useAuth();
  const { history, removeFromHistory, loading } = useHistory();

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden fade-in">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-purple-500 to-accent"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-2xl font-serif text-white shadow-lg shadow-accent/20 border-2 border-white/10">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-serif text-warm">{user?.name}</h2>
            <p className="text-sm text-muted mt-0.5">{user?.email}</p>
          </div>
        </div>
        <button onClick={onBack} className="px-5 py-2.5 bg-deep/80 hover:bg-border text-warm text-sm rounded-xl transition-all border border-border flex items-center gap-2 group">
          <svg className="w-4 h-4 text-muted group-hover:text-warm transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Generator
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-serif text-warm flex items-center gap-3">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          Your Saved Drafts
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted space-y-4">
            <svg className="animate-spin w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p>Loading your history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-deep/30 rounded-3xl border border-dashed border-border flex flex-col items-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 border border-white/5">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-muted text-lg mb-2">Your history is empty</p>
            <p className="text-sm text-muted/60 max-w-sm mb-6">Generated drafts you save will appear here so you can access them anytime.</p>
            <button onClick={onBack} className="px-6 py-2.5 bg-accent hover:bg-accent-light text-white rounded-xl transition-colors font-medium">
              Start Writing
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {history.map((draft) => (
              <div key={draft._id} className="group bg-deep/50 border border-border hover:border-accent/40 rounded-3xl p-6 transition-all duration-300 flex flex-col h-full relative overflow-hidden shadow-lg hover:shadow-accent/5">
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="inline-block px-3 py-1 bg-surface rounded-lg text-xs font-semibold text-accent border border-white/5 uppercase tracking-wider">
                        {draft.situation.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted font-medium bg-deep px-2 py-1 rounded-lg border border-border">
                        for {draft.relationship.replace('_', ' ')}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeFromHistory(draft._id)}
                      className="text-muted hover:text-red-400 transition-colors p-2 -mr-2 -mt-2 rounded-full hover:bg-red-400/10"
                      title="Delete draft"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 text-sm text-warm/90 leading-relaxed font-serif bg-surface/50 p-5 rounded-2xl border border-white/5 mb-5 shadow-inner">
                    <div className="line-clamp-4 italic">"{draft.draftText}"</div>
                  </div>

                  <div className="text-xs text-muted mt-auto flex justify-between items-center px-1">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                      <span className="capitalize">{draft.tone}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(draft.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
