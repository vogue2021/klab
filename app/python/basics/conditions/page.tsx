export default function ConditionsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">条件语句</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">if 语句</h2>
        <p className="mb-4">
          条件语句用于根据不同的条件执行不同的代码块。在Haskell中，最基本的条件语句是 if 表达式。
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <pre className="text-sm">
            <code>{`if condition
    then expression1  -- 当条件为True时执行
    else expression2  -- 当条件为False时执行`}</code>
          </pre>
        </div>
      </section>

      {/* 其他内容... */}
    </div>
  )
} 