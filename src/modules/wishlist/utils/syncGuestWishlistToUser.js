// src/modules/wishlist/utils/syncGuestWishlistToUser.js

import { syncGuestWishlist } from "@/modules/customer/api/customerWishlist.api";

const GUEST_WISHLIST_KEY = "killavibes_wishlist_guest";

export const syncGuestWishlistToUser = async () => {
    try {
        const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
        if (!raw) {
            return { success: true, migratedCount: 0 };
        }

        const guestWishlist = JSON.parse(raw);

        if (!Array.isArray(guestWishlist) || guestWishlist.length === 0) {
            return { success: true, migratedCount: 0 };
        }

        const result = await syncGuestWishlist(guestWishlist);

        // 🧹 Limpieza solo si fue exitoso
        if (result?.success !== false) {
            localStorage.removeItem(GUEST_WISHLIST_KEY);
        }

        return {
            success: true,
            migratedCount: result.migratedCount || guestWishlist.length,
        };
    } catch (error) {
        console.error("[Wishlist Sync] Error:", error);
        return {
            success: false,
            migratedCount: 0,
            error: error.message,
        };
    }
};
