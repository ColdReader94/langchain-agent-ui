import { useCallback, useEffect, useRef, useState } from 'react';
import type { IChatTemplate } from '../interfaces';
import './templatesPanel.css';

export function TemplatesPanel({ templates, onSelect }: { templates: IChatTemplate[]; onSelect: (t: IChatTemplate) => void }) {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [showButtons, setShowButtons] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [currItemIndex, setCurrItemIndex] = useState(0);

    const updateButtonsVisibility = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 2);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);

        setShowButtons(el.scrollWidth > el.clientWidth + 2);
    }, []);

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
        setCurrItemIndex(currItemIndex - 1);
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
        setCurrItemIndex(currItemIndex + 1);
    };

    useEffect(() => {
        updateButtonsVisibility();
    }, [templates, updateButtonsVisibility]);

    if (!templates?.length) return null;

    return (
        <div className="templates-carousel" role="region" aria-label="Templates">
            {showButtons && (
                <button
                    type="button"
                    disabled={!canScrollLeft}
                    className="carousel-btn left"
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                    aria-controls="templates-list"
                >
                    ‹
                </button>
            )}

            <div className="templates-chips-carousel" ref={scrollRef} onScroll={updateButtonsVisibility}>
                {templates.map((tpl, index) => (
                    <div key={tpl.name} role="listitem">
                        <button inert={index !== currItemIndex} type="button" className="template-chip" onClick={() => onSelect(tpl)}>
                            <span className="template-chip-text">{tpl.title}</span>
                        </button>
                    </div>
                ))}
            </div>

            {showButtons && (
                <button
                    type="button"
                    disabled={!canScrollRight}
                    className="carousel-btn right"
                    onClick={scrollRight}
                    aria-label="Scroll right"
                    aria-controls="templates-list"
                >
                    ›
                </button>
            )}
        </div>
    );
}
