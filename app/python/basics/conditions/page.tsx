export default function ConditionsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">条件语句</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">if 语句</h2>
        <p className="mb-4">
          条件语句用于根据不同的条件执行不同的代码块。Python中最基本的条件语句是 if 语句。
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <pre className="text-sm">
            <code>{`if condition:
    # 当条件为True时执行的代码
    pass`}</code>
          </pre>
        </div>
      </section>

      {/* 更多内容... */}
    </div>
  )
} 