export default function ConditionsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">条件文</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">if 文</h2>
        <p className="mb-4">
          条件文は異なる条件に基づいて異なるコードブロックを実行するために使用されます。Pythonの最も基本的な条件文は if 文です。
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <pre className="text-sm">
            <code>{`if condition:
    # 条件がTrueの時に実行されるコード
    pass`}</code>
          </pre>
        </div>
      </section>

      {/* その他のコンテンツ... */}
    </div>
  )
} 