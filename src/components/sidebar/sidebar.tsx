import { useEffect, useRef, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import './sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    position?: string;
}

export const Sidebar = ({ isOpen, setIsOpen, onClose, children, className = '', position = 'left' }: SidebarProps) => {
    const sidebarRef: Ref<HTMLElement> = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        setTimeout(() => {
            sidebarRef.current?.classList?.add(`agent-side-panel--${isOpen ? 'enter' : 'out'}`);
        }, 0);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return createPortal(
        <>
            <aside ref={sidebarRef} className={`agent-side-panel ${position} ${className}`}>
                <button onClick={onClose} className="cross-btn btn-reset" />
                <div className="agent-side-panel__container">{children}</div>
            </aside>
            <div onClick={() => setIsOpen(false)} className="overlay"></div>
        </>,
        document.body,
    );
};
