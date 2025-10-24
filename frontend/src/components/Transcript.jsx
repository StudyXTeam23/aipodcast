const Transcript = ({ text }) => {
  if (!text || text.trim() === '') {
    return (
      <div className="h-96 overflow-y-auto p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-center">No transcript available</p>
      </div>
    );
  }

  // 解析对话文本，保留说话者信息并格式化显示
  const parseDialogue = (rawText) => {
    const lines = rawText.split('\n');
    const dialogueSegments = [];
    let currentSpeaker = null;
    let currentText = [];
    
    // 匹配任意名字后跟冒号的格式：Alex:, Ben:, 小明：, Host A:, 等
    const speakerPattern = /^([A-Za-z\u4e00-\u9fa5][A-Za-z\u4e00-\u9fa5\s0-9]*?)[:：]\s*(.*)$/;
    
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      
      const match = line.match(speakerPattern);
      if (match) {
        // 保存前一个说话者的内容
        if (currentSpeaker && currentText.length > 0) {
          dialogueSegments.push({
            speaker: currentSpeaker,
            text: currentText.join(' ')
          });
        }
        
        // 开始新说话者
        currentSpeaker = match[1];
        currentText = [match[2]];
      } else {
        // 继续当前说话者的文本
        if (currentText.length > 0) {
          currentText.push(line);
        }
      }
    });
    
    // 保存最后一个说话者
    if (currentSpeaker && currentText.length > 0) {
      dialogueSegments.push({
        speaker: currentSpeaker,
        text: currentText.join(' ')
      });
    }
    
    return dialogueSegments;
  };

  const dialogueSegments = parseDialogue(text);

  return (
    <div className="h-96 overflow-y-auto p-6 bg-gray-800 rounded-lg">
      <div className="flex flex-col gap-4 text-gray-200 leading-relaxed">
        {dialogueSegments.map((segment, index) => (
          <div key={index} className="flex flex-col gap-1">
            <span className="text-primary font-semibold text-sm">{segment.speaker}:</span>
            <p className="text-base pl-4">{segment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transcript;


