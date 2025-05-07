import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const [svgCode, setSvgCode] = useState('');

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });

    const renderMermaid = async () => {
      try {
        console.log('📄 Mermaid input chart:', chart);
        const { svg } = await mermaid.render('generatedDiagram', chart);
        console.log('🧪 Mermaid SVG Output:', svg);
        setSvgCode(svg);
      } catch (err) {
        console.error('❌ Mermaid rendering failed:', err);
        setSvgCode('<p style="color:red;">⚠️ Failed to render diagram</p>');
      }
    };

    renderMermaid();
  }, [chart]);

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'auto',
        minHeight: '220px',
        minWidth: '100%',
        textAlign: 'center',
      }}
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  );
}
