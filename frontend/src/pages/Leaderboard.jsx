import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUserId = localStorage.getItem('devleap_user_id');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('/api/users/leaderboard');
                setLeaders(res.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const topThree = leaders.slice(0, 3);
    const restLeaders = leaders.slice(3);

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

    // Mock functions for missing backend data
    const getMockStreak = (index) => Math.max(1, 35 - index * 3);
    const getXP = (solvedCount) => solvedCount * 100;
    const getAvatarSrc = (index) => {
        const avatars = [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDGJrftHG63nushkspW755DJj8CQGcbVS0T_uIChky12E3y4B1FgvMTXQdCej9RuR9qNHYT2fteMeoDXVJjWEfPC4WW8apgs0CqWX21H4BLSSBYil27zveieUOtjPnLRiFC_ii_xQSZsxNXxydSC1PMi7XLlubmO0TgZbMcp6EB9v6NLk5JXJsaK4FerQmD5d9Ay8YlQD9o_vIXaDRDl01XHc9CkdAANRgSBBtO6m7fZUOPyFvfX4F88ua_63yp_jjfW98Un9bUNzD8",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDnYWJuTR6Z3NMAQO2QAbQYyFK6S62Z2glSKm3LrVTUtd4VxQQLXEvnuBUfESvD8A97Piddh1gtMggYEA3HvZ-7Eb9as12jW8txEFVeMYli1ix7kTAO5DOzicdbGKzHWiL3aUuYDZESFKsF8MZV4BnHO-vnaRDJwDENVj3r4p8ymOozBcxj-i6xePCwW1MslSUaXg3i61LYbD_h8NanSkYP0r45dcB6JlsHp2gMM-byftSdIPQdLnXyItnipL0VGjZr6WP3H3jstwGw",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDUq1ZEdXlQDQGZ21PBT1invgWovJh_3cEORD4x2njto_VfmtZbqecbPh2Icyakw1EDTtDywQZ4AVVAiMm71HWf2mvfWFv5zLk-SDSoEiVm3aTVb49zBWjqpqrmz5OCScTyBhvDXA2ewu2Rr7roEVxbdDydPU971hpPbkPrFGjbtBJUSzjSE8LkVpsUR8I9abxWUFTZvZiBFt18AXeMybJGUYLtr3jDMjr79OZh_06uC6hTyg0w-V8A5a8c5n1ui7im7lDLXK9WLMtc"
        ];
        return avatars[index] || null;
    };

    return (
        <div className="antialiased min-h-screen pb-xl pt-[120px] px-lg max-w-container-max mx-auto bg-surface-container-lowest">
            <div className="text-center mb-16">
                <h1 className="text-[40px] font-bold text-on-surface mb-2 tracking-tight">Global Leaderboard</h1>
                <p className="font-body-lg text-on-surface-variant">Season 4 • Ends in 12 Days</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-on-surface-variant text-xl">
                    Calculating Ranks...
                </div>
            ) : leaders.length === 0 ? (
                <div className="text-center py-20 text-on-surface-variant text-xl">
                    No data available yet. Start solving problems!
                </div>
            ) : (
                <>
                    {/* Podium Section for Top 3 */}
                    <div className="flex justify-center items-end gap-6 mb-20 mt-12 relative max-w-3xl mx-auto h-[280px]">
                        {/* Rank 2: Silver */}
                        {topThree[1] && (
                            <div className="flex flex-col items-center w-[200px] relative">
                                <div className="absolute -top-12 z-20">
                                    <div className="w-[72px] h-[72px] rounded-full border-[3px] border-gray-400 p-1 bg-surface-container-lowest overflow-hidden shadow-[0_0_15px_rgba(156,163,175,0.4)]">
                                        <img alt="Silver Avatar" className="w-full h-full rounded-full object-cover" src={topThree[1].avatar || getAvatarSrc(1)} />
                                    </div>
                                </div>
                                <div className="glass-panel w-full h-[160px] rounded-xl flex flex-col justify-center items-center border border-gray-400/40 glow-silver relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute top-0 w-full h-1 bg-gray-400/50 shadow-[0_0_10px_rgba(156,163,175,0.8)]"></div>
                                    <span className="text-[48px] font-bold text-gray-400/80 drop-shadow-md">2</span>
                                    <span className="text-on-surface font-semibold truncate w-[140px] text-center">{topThree[1].username}</span>
                                    <span className="text-gray-400 text-sm font-bold">{getXP(topThree[1].solvedCount)} XP</span>
                                </div>
                            </div>
                        )}

                        {/* Rank 1: Gold */}
                        {topThree[0] && (
                            <div className="flex flex-col items-center w-[240px] relative z-10">
                                <div className="absolute -top-16 z-20">
                                    <div className="w-[96px] h-[96px] rounded-full border-[3px] border-yellow-500 p-1 bg-surface-container-lowest overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                                        <img alt="Gold Avatar" className="w-full h-full rounded-full object-cover" src={topThree[0].avatar || getAvatarSrc(0)} />
                                    </div>
                                </div>
                                <div className="glass-panel w-full h-[200px] rounded-xl flex flex-col justify-center items-center border border-yellow-500/50 glow-gold relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute top-0 w-full h-1 bg-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.9)]"></div>
                                    <span className="text-[56px] font-bold text-yellow-500/90 drop-shadow-lg">1</span>
                                    <span className="text-on-surface font-semibold text-lg truncate w-[180px] text-center">{topThree[0].username}</span>
                                    <span className="text-yellow-500 text-md font-bold">{getXP(topThree[0].solvedCount)} XP</span>
                                </div>
                            </div>
                        )}

                        {/* Rank 3: Bronze */}
                        {topThree[2] && (
                            <div className="flex flex-col items-center w-[200px] relative">
                                <div className="absolute -top-12 z-20">
                                    <div className="w-[72px] h-[72px] rounded-full border-[3px] border-orange-600 p-1 bg-surface-container-lowest overflow-hidden shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                                        <img alt="Bronze Avatar" className="w-full h-full rounded-full object-cover" src={topThree[2].avatar || getAvatarSrc(2)} />
                                    </div>
                                </div>
                                <div className="glass-panel w-full h-[120px] rounded-xl flex flex-col justify-center items-center border border-orange-600/40 glow-bronze relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute top-0 w-full h-1 bg-orange-600/50 shadow-[0_0_10px_rgba(234,88,12,0.8)]"></div>
                                    <span className="text-[48px] font-bold text-orange-600/80 drop-shadow-md">3</span>
                                    <span className="text-on-surface font-semibold truncate w-[140px] text-center">{topThree[2].username}</span>
                                    <span className="text-orange-600 text-sm font-bold">{getXP(topThree[2].solvedCount)} XP</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Table (Ranks 4+) */}
                    {restLeaders.length > 0 && (
                        <div className="bg-surface-container rounded-xl overflow-hidden mt-8 max-w-5xl mx-auto border border-outline-variant/10 shadow-lg">
                            <div className="w-full text-left">
                                {/* Header */}
                                <div className="flex items-center px-8 py-4 border-b border-outline-variant/10 text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                                    <div className="w-16">RANK</div>
                                    <div className="flex-1">DEVELOPER</div>
                                    <div className="w-40 hidden sm:block text-center">SOLVED</div>
                                    <div className="w-32 text-center">STREAK</div>
                                    <div className="w-32 text-right">SCORE</div>
                                </div>
                                {/* Rows */}
                                <div className="flex flex-col">
                                    {restLeaders.map((user, idx) => {
                                        const globalRank = idx + 4;
                                        const isCurrentUser = user._id === currentUserId;

                                        return (
                                            <div key={user._id} className={`flex items-center px-8 py-5 border-b border-outline-variant/10 hover:bg-white/[0.02] transition-colors ${isCurrentUser ? 'bg-primary-container/10' : ''}`}>
                                                <div className="w-16 font-bold text-xl text-on-surface-variant">{globalRank}</div>
                                                <div className="flex-1 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-[18px] font-bold text-on-surface-variant border border-outline-variant/30">
                                                        {getInitials(user.username)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[15px] text-on-surface flex items-center gap-1.5">
                                                            {user.username} {isCurrentUser && <span className="text-primary text-xs ml-2">(You)</span>}
                                                            {idx % 3 === 0 && <span className="text-tertiary material-symbols-outlined text-[14px]">arrow_upward</span>}
                                                        </div>
                                                        <div className="text-[13px] text-on-surface-variant mt-0.5">Developer</div>
                                                    </div>
                                                </div>
                                                <div className="w-40 hidden sm:flex justify-center">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-md border border-outline-variant/20">
                                                        <span className="material-symbols-outlined text-[14px]">code</span> {user.solvedCount}
                                                    </div>
                                                </div>
                                                <div className="w-32 flex items-center justify-center gap-1 text-orange-500">
                                                    <span className="text-[13px] font-medium">{user.streakDays || 0}</span>
                                                    <span className="material-symbols-outlined text-[14px] glow-fire">local_fire_department</span>
                                                </div>
                                                <div className="w-32 text-right text-[13px] font-semibold text-primary-fixed">{getXP(user.solvedCount)} XP</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="py-4 text-center border-t border-outline-variant/10 bg-surface-container/50">
                                <button className="text-[12px] font-semibold text-primary-fixed hover:text-primary transition-colors tracking-wide">Load More Ranks</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                .glass-panel {
                    background: rgba(31, 31, 38, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .glow-gold { box-shadow: 0 0 40px rgba(234, 179, 8, 0.15), inset 0 0 20px rgba(234, 179, 8, 0.05); }
                .glow-silver { box-shadow: 0 0 30px rgba(156, 163, 175, 0.1), inset 0 0 15px rgba(156, 163, 175, 0.05); }
                .glow-bronze { box-shadow: 0 0 30px rgba(234, 88, 12, 0.1), inset 0 0 15px rgba(234, 88, 12, 0.05); }
                .glow-fire {
                    color: #f97316;
                    filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.6));
                }
            `}</style>
        </div>
    );
};

export default Leaderboard;