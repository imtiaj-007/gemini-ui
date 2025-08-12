import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Country = {
    name: {
        common: string;
    };
    cca3: string;
    idd: {
        root?: string;
        suffixes?: string[];
    };
    flags: {
        png: string;
        svg: string;
        alt?: string;
    };
};

interface AuthState {
    isAuthenticated: boolean;
    user: { phone: string } | null;
    countries: Country[];
    loading: boolean;
    login: (user: { phone: string }) => void;
    logout: () => void;
    fetchCountries: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            countries: [],
            loading: true,
            login: (user) => set({ isAuthenticated: true, user, loading: false }),
            logout: () => set({ isAuthenticated: false, user: null, loading: false }),
            fetchCountries: async () => {
                try {
                    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca3,idd,flags");
                    const data = await response.json();
                    const dialCodeSet = new Set<string>();
                    const validCountries = data
                        .map((c: Country) => {
                            const dialCode = `${c.idd?.root}${c.idd?.suffixes?.[0] || ''}`;
                            if (!c.idd?.root || dialCodeSet.has(dialCode)) return null;
                            dialCodeSet.add(dialCode);
                            return c;
                        })
                        .filter((c: Country) => c !== null);
                    set({ countries: validCountries });
                } catch (error) {
                    console.error('Failed to fetch countries:', error);
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) state.loading = false;
            },
        }
    )
);