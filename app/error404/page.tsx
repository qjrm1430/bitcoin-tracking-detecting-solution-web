import { XCircleIcon } from "@heroicons/react/20/solid";

export default function Example() {
  return (
    <div className="flex bg-red-50 items-center justify-center min-h-screen pb-40">
      <div>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <h3 className="ml-3 mb-0.5 text-lg font-medium text-red-800">
            404 Not Found
          </h3>
        </div>
        <div className="mt-2 text-md text-red-700">
          <ul role="list" className="list-disc space-y-1 pl-5">
            <li>이런! 사용자님이 찾고 계신 정보를 찾을 수 없습니다.</li>
            <li>
              정확한 지갑 주소, 트랜젝션 해시값, 클러스트 이름/해시값을
              입력하세요.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
