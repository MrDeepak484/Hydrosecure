import { useState, useEffect } from 'react';
import localforage from 'localforage';
import axios from 'axios';

export const useSync = () => {
    const [offlineQueueCount, setOfflineQueueCount] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Setup listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        updateQueueCount();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // When coming back online, try to sync
    useEffect(() => {
        if (isOnline && offlineQueueCount > 0 && !isSyncing) {
            syncReadings();
        }
    }, [isOnline, offlineQueueCount]);

    const updateQueueCount = async () => {
        const queue = await localforage.getItem('readingsQueue') || [];
        setOfflineQueueCount(queue.length);
    };

    const queueReading = async (readingData) => {
        const queue = await localforage.getItem('readingsQueue') || [];
        queue.push({
            ...readingData,
            _queueId: Date.now().toString()
        });
        await localforage.setItem('readingsQueue', queue);
        updateQueueCount();
    };

    const syncReadings = async () => {
        setIsSyncing(true);
        try {
            let queue = await localforage.getItem('readingsQueue') || [];
            if (queue.length === 0) return;

            const successfullySynced = [];

            // Note: A real app might batch these, we loop for simplicity
            for (const item of queue) {
                try {
                    // Prepare formData for file upload sync
                    const formData = new FormData();
                    formData.append('site_id', item.site_id);
                    formData.append('water_level', item.water_level);
                    formData.append('lat', item.lat);
                    formData.append('lng', item.lng);
                    formData.append('timestamp', item.timestamp);
                    formData.append('is_tampered', item.is_tampered);

                    if (item.photoBlob) {
                        formData.append('photo', item.photoBlob, `offline-sync-${item._queueId}.jpg`);
                    }

                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    await axios.post(`${API_BASE_URL}/api/readings`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    successfullySynced.push(item._queueId);
                } catch (err) {
                    console.error("Failed to sync item", item, err);
                    // If it fails with 4xx we might want to discard, for now we just break or retry later
                }
            }

            // Remove synced items from queue
            queue = queue.filter(q => !successfullySynced.includes(q._queueId));
            await localforage.setItem('readingsQueue', queue);
            updateQueueCount();

        } catch (err) {
            console.error("Sync process error", err);
        } finally {
            setIsSyncing(false);
        }
    };

    return { isOnline, offlineQueueCount, isSyncing, queueReading, syncReadings };
};
